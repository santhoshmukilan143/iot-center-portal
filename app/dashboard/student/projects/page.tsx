'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  FolderKanban,
  Github,
  ExternalLink,
  CalendarDays,
  RefreshCw,
  Users,
} from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  technologies: string[] | null;
  stage: string;
  progress: number;
  github_url: string | null;
  demo_url: string | null;
  documentation_url: string | null;
  group_id: string | null;
  created_at: string;
};

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    const groupIds = memberships?.map((item) => item.group_id) || [];

    let query = supabase
      .from('projects')
      .select(
        'id, title, description, image_url, technologies, stage, progress, github_url, demo_url, documentation_url, group_id, created_at'
      )
      .order('created_at', { ascending: false });

    if (groupIds.length > 0) {
      query = query.in('group_id', groupIds);
    } else {
      query = query.is('group_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setProjects([]);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function stageLabel(stage: string) {
    return stage.replaceAll('_', ' ');
  }

  return (
    <DashboardShell role="student" title="Projects">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">My Projects</h2>

          <p className="mt-1 text-sm text-slate-400">
            Projects connected to your research groups.
          </p>
        </div>

        <button
          onClick={loadProjects}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

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
            No projects yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Projects assigned to your group will appear here.
          </p>
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

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-600">
                    {stageLabel(project.stage)}
                  </span>
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
                      Project Progress
                    </span>

                    <span className="font-black text-blue-600">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Technologies */}
                {project.technologies &&
                  project.technologies.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
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

                <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  Created · {formatDate(project.created_at)}
                </div>

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

                  {project.group_id && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500">
                      <Users size={15} />
                      Group Project
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
