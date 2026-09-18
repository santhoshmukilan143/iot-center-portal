'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  Github,
  ExternalLink,
  Users,
  UserRound,
} from 'lucide-react';

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
  created_at: string;
};

type Group = {
  id: string;
  name: string;
};

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
};

export default function FacultyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [groupId, setGroupId] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [stage, setStage] = useState('idea');
  const [progress, setProgress] = useState('0');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: projectData, error: projectError } =
      await supabase
        .from('projects')
        .select(
          'id, title, description, image_url, group_id, mentor_id, technologies, stage, progress, github_url, demo_url, documentation_url, featured, created_at'
        )
        .order('created_at', { ascending: false });

    if (projectError) {
      console.error(projectError);
      setProjects([]);
    } else {
      setProjects(projectData || []);
    }

    const { data: groupData, error: groupError } =
      await supabase
        .from('groups')
        .select('id, name')
        .order('name', { ascending: true });

    if (groupError) {
      console.error(groupError);
    } else {
      setGroups(groupData || []);
    }

    const { data: profileData, error: profileError } =
      await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['faculty', 'admin'])
        .order('full_name', { ascending: true });

    if (profileError) {
      console.error(profileError);
    } else {
      setProfiles(profileData || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setGroupId('');
    setMentorId('');
    setTechnologies('');
    setStage('idea');
    setProgress('0');
    setGithubUrl('');
    setDemoUrl('');
    setDocumentationUrl('');
    setFeatured(false);
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(project: Project) {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description || '');
    setImageUrl(project.image_url || '');
    setGroupId(project.group_id || '');
    setMentorId(project.mentor_id || '');
    setTechnologies(project.technologies?.join(', ') || '');
    setStage(project.stage || 'idea');
    setProgress(String(project.progress ?? 0));
    setGithubUrl(project.github_url || '');
    setDemoUrl(project.demo_url || '');
    setDocumentationUrl(project.documentation_url || '');
    setFeatured(project.featured || false);
    setShowModal(true);
  }

  async function saveProject() {
    if (!title.trim()) {
      alert('Please enter project title.');
      return;
    }

    const progressNumber = Number(progress);

    if (
      Number.isNaN(progressNumber) ||
      progressNumber < 0 ||
      progressNumber > 100
    ) {
      alert('Progress must be between 0 and 100.');
      return;
    }

    setSaving(true);

    const technologiesList = technologies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      group_id: groupId || null,
      mentor_id: mentorId || null,
      technologies: technologiesList,
      stage,
      progress: progressNumber,
      github_url: githubUrl.trim() || null,
      demo_url: demoUrl.trim() || null,
      documentation_url: documentationUrl.trim() || null,
      featured,
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
      alert(error.message);
    } else {
      setShowModal(false);
      resetForm();
      await loadData();
    }

    setSaving(false);
  }

  async function deleteProject(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      await loadData();
    }
  }

  function getGroupName(id: string | null) {
    if (!id) return 'No group';

    return (
      groups.find((group) => group.id === id)?.name ||
      'Unknown group'
    );
  }

  function getMentorName(id: string | null) {
    if (!id) return 'Not assigned';

    return (
      profiles.find((profile) => profile.id === id)?.full_name ||
      'Unknown mentor'
    );
  }

  function formatStage(value: string) {
    return value.replaceAll('_', ' ');
  }

  return (
    <DashboardShell role="faculty" title="Projects">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Projects</h2>

          <p className="mt-1 text-sm text-slate-400">
            Create and manage student research projects.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="btn border bg-white text-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={openCreate}
            className="btn bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Create Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Total Projects
          </p>

          <p className="mt-1 text-2xl font-black">
            {projects.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Completed
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              projects.filter(
                (project) => project.stage === 'completed'
              ).length
            }
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Featured
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              projects.filter(
                (project) => project.featured
              ).length
            }
          </p>
        </div>
      </div>

      {/* Project List */}
      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <FolderKanban size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No projects found
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Create your first research project.
          </p>

          <button
            onClick={openCreate}
            className="btn mt-5 bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.id}
              className="card overflow-hidden"
            >
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="h-52 w-full object-cover"
                />
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <FolderKanban size={21} />
                  </div>

                  <div className="flex items-center gap-2">
                    {project.featured && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                        Featured
                      </span>
                    )}

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-600">
                      {formatStage(project.stage)}
                    </span>
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {project.title}
                </h3>

                {project.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">
                      Progress
                    </span>

                    <span className="font-black text-blue-600">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${project.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Group / Mentor */}
                <div className="mt-5 space-y-3 border-t pt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Users size={16} />

                    <span>
                      Group · {getGroupName(project.group_id)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <UserRound size={16} />

                    <span>
                      Mentor · {getMentorName(project.mentor_id)}
                    </span>
                  </div>
                </div>

                {/* Technologies */}
                {project.technologies &&
                  project.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Links */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#07162d] px-4 py-2.5 text-xs font-bold text-white"
                    >
                      <Github size={15} />
                      GitHub
                    </a>
                  )}

                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
                    >
                      <ExternalLink size={15} />
                      Demo
                    </a>
                  )}

                  {project.documentation_url && (
                    <a
                      href={project.documentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
                    >
                      <ExternalLink size={15} />
                      Documentation
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2 border-t pt-4">
                  <button
                    onClick={() => openEdit(project)}
                    className="btn flex-1 border bg-white text-slate-700"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="grid h-10 w-10 place-items-center rounded-xl border text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Project'
                    : 'Create Project'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Add project information and research details.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="text-sm font-bold">
                  Project Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder="Project title"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={4}
                  className="input mt-2 w-full resize-none"
                  placeholder="Describe the project..."
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Image URL
                </label>

                <input
                  value={imageUrl}
                  onChange={(e) =>
                    setImageUrl(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold">
                    Student Group
                  </label>

                  <select
                    value={groupId}
                    onChange={(e) =>
                      setGroupId(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="">
                      Select group
                    </option>

                    {groups.map((group) => (
                      <option
                        key={group.id}
                        value={group.id}
                      >
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Mentor
                  </label>

                  <select
                    value={mentorId}
                    onChange={(e) =>
                      setMentorId(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="">
                      Select mentor
                    </option>

                    {profiles.map((profile) => (
                      <option
                        key={profile.id}
                        value={profile.id}
                      >
                        {profile.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Technologies
                </label>

                <input
                  value={technologies}
                  onChange={(e) =>
                    setTechnologies(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="ESP32, Python, React, Supabase"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Separate technologies using commas.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold">
                    Stage
                  </label>

                  <select
                    value={stage}
                    onChange={(e) =>
                      setStage(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="idea">Idea</option>
                    <option value="research">Research</option>
                    <option value="design">Design</option>
                    <option value="development">
                      Development
                    </option>
                    <option value="testing">Testing</option>
                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Progress %
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) =>
                      setProgress(e.target.value)
                    }
                    className="input mt-2 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold">
                  GitHub URL
                </label>

                <input
                  value={githubUrl}
                  onChange={(e) =>
                    setGithubUrl(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Demo URL
                </label>

                <input
                  value={demoUrl}
                  onChange={(e) =>
                    setDemoUrl(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Documentation URL
                </label>

                <input
                  value={documentationUrl}
                  onChange={(e) =>
                    setDocumentationUrl(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="https://..."
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) =>
                    setFeatured(e.target.checked)
                  }
                  className="h-5 w-5"
                />

                <div>
                  <div className="text-sm font-bold">
                    Featured Project
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Highlight this project in the portal.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="btn border bg-white text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={saveProject}
                disabled={saving}
                className="btn bg-[#07162d] text-white disabled:opacity-50"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Project'
                    : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
