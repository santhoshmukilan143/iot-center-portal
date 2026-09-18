'use client';

import { useEffect, useState } from 'react';
import {
  FolderKanban,
  ExternalLink,
  CalendarDays,
  RefreshCw,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';

type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  group_id: string | null;
  mentor_id: string | null;
  technologies: string[] | null;
  stage: string;
  progress: number;
  github_url: string | null;
  demo_url: string | null;
  documentation_url: string | null;
  featured: boolean;
};

type Group = {
  id: string;
  name: string;
};

type Profile = {
  id: string;
  full_name: string;
};

const stages = [
  'idea',
  'research',
  'design',
  'development',
  'testing',
  'completed',
];

const emptyForm = {
  title: '',
  description: '',
  image_url: '',
  group_id: '',
  mentor_id: '',
  technologies: '',
  stage: 'idea',
  progress: 0,
  github_url: '',
  demo_url: '',
  documentation_url: '',
  featured: false,
};

export default function FacultyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [faculty, setFaculty] = useState<Profile[]>([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setMessage('');

    const [
      { data: projectData, error: projectError },
      { data: groupData },
      { data: facultyData },
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('groups')
        .select('id,name')
        .order('name'),

      supabase
        .from('profiles')
        .select('id,full_name')
        .in('role', ['faculty', 'admin'])
        .order('full_name'),
    ]);

    if (projectError) {
      setMessage(projectError.message);
    }

    setProjects(projectData || []);
    setGroups(groupData || []);
    setFaculty(facultyData || []);

    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setShowForm(true);
  }

  function openEdit(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title || '',
      description: project.description || '',
      image_url: project.image_url || '',
      group_id: project.group_id || '',
      mentor_id: project.mentor_id || '',
      technologies: project.technologies?.join(', ') || '',
      stage: project.stage || 'idea',
      progress: project.progress || 0,
      github_url: project.github_url || '',
      demo_url: project.demo_url || '',
      documentation_url: project.documentation_url || '',
      featured: project.featured || false,
    });

    setMessage('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveProject() {
    if (!form.title.trim()) {
      setMessage('Project title is required.');
      return;
    }

    setSaving(true);
    setMessage('');

    const technologies = form.technologies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      group_id: form.group_id || null,
      mentor_id: form.mentor_id || null,
      technologies,
      stage: form.stage,
      progress: Number(form.progress),
      github_url: form.github_url.trim() || null,
      demo_url: form.demo_url.trim() || null,
      documentation_url: form.documentation_url.trim() || null,
      featured: form.featured,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from('projects')
        .update(payload)
        .eq('id', editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from('projects')
        .insert(payload);

      error = result.error;
    }

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        editingId
          ? 'Project updated successfully.'
          : 'Project created successfully.'
      );

      closeForm();
      await loadData();
    }

    setSaving(false);
  }

  async function deleteProject(id: string) {
    const ok = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!ok) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Project deleted successfully.');
      await loadData();
    }
  }

  function groupName(id: string | null) {
    if (!id) return 'No group';

    return (
      groups.find((group) => group.id === id)?.name ||
      'Unknown group'
    );
  }

  function mentorName(id: string | null) {
    if (!id) return 'No mentor';

    return (
      faculty.find((person) => person.id === id)?.full_name ||
      'Unknown mentor'
    );
  }

  return (
    <DashboardShell role="faculty" title="Projects">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black">
              Project Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create, update and manage student research projects.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="btn border bg-white text-slate-700"
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? 'animate-spin' : ''}
              />
              Refresh
            </button>

            <button
              onClick={openAdd}
              className="btn bg-[#07162d] text-white"
            >
              <Plus size={16} />
              Add Project
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-slate-600">
            {message}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">
                  {editingId ? 'Edit Project' : 'Create Project'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Enter the project details below.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="grid h-9 w-9 place-items-center rounded-xl border bg-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">Project Title</label>

                <input
                  className="input"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter project title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Description</label>

                <textarea
                  className="input min-h-28"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Project description"
                />
              </div>

              <div>
                <label className="label">Group</label>

                <select
                  className="input"
                  value={form.group_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      group_id: e.target.value,
                    })
                  }
                >
                  <option value="">No group</option>

                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Mentor</label>

                <select
                  className="input"
                  value={form.mentor_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mentor_id: e.target.value,
                    })
                  }
                >
                  <option value="">No mentor</option>

                  {faculty.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Stage</label>

                <select
                  className="input"
                  value={form.stage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stage: e.target.value,
                    })
                  }
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Progress (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input"
                  value={form.progress}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      progress: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  Technologies
                </label>

                <input
                  className="input"
                  value={form.technologies}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      technologies: e.target.value,
                    })
                  }
                  placeholder="ESP32, Python, React, Supabase"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Separate technologies with commas.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="label">Image URL</label>

                <input
                  className="input"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="label">GitHub URL</label>

                <input
                  className="input"
                  value={form.github_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      github_url: e.target.value,
                    })
                  }
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="label">Demo URL</label>

                <input
                  className="input"
                  value={form.demo_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      demo_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">
                  Documentation URL
                </label>

                <input
                  className="input"
                  value={form.documentation_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      documentation_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featured: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-semibold">
                  Featured project
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-5">
              <button
                onClick={closeForm}
                className="btn border bg-white text-slate-700"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={saveProject}
                className="btn bg-[#07162d] text-white"
                disabled={saving}
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <SaveIcon />
                )}

                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Project'
                  : 'Create Project'}
              </button>
            </div>
          </div>
        )}

        {/* Projects */}
        {loading ? (
          <div className="card flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderKanban
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-black">
              No projects yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Create your first project using the button above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="card overflow-hidden"
              >
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="h-44 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black">
                          {project.title}
                        </h3>

                        {project.featured && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                            FEATURED
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {project.description ||
                          'No description available.'}
                      </p>
                    </div>

                    <FolderKanban
                      size={20}
                      className="shrink-0 text-slate-400"
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users size={15} />
                      {groupName(project.group_id)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <UserIcon />
                      {mentorName(project.mentor_id)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={15} />
                      {project.stage.replace('_', ' ')}
                    </div>

                    <div className="text-xs font-bold text-slate-600">
                      Progress: {project.progress}%
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, project.progress)
                        )}%`,
                      }}
                    />
                  </div>

                  {project.technologies &&
                    project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <div className="flex gap-3">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-600"
                        >
                          GitHub
                          <ExternalLink size={13} />
                        </a>
                      )}

                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-600"
                        >
                          Demo
                          <ExternalLink size={13} />
                        </a>
                      )}

                      {project.documentation_url && (
                        <a
                          href={project.documentation_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-600"
                        >
                          Docs
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(project)}
                        className="grid h-9 w-9 place-items-center rounded-xl border bg-white text-slate-600"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() =>
                          deleteProject(project.id)
                        }
                        className="grid h-9 w-9 place-items-center rounded-xl border bg-white text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function SaveIcon() {
  return <span className="text-sm">✓</span>;
}

function UserIcon() {
  return <span className="text-xs">👤</span>;
}
