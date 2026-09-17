'use client';

import { useEffect, useState } from 'react';
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
  created_at: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProjects() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('projects')
      .select(
        'id, title, description, image_url, group_id, mentor_id, technologies, stage, progress, github_url, demo_url, documentation_url, featured, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setProjects([]);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Faculty Console
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Projects
            </h1>

            <p className="mt-2 text-slate-500">
              Monitor student projects and research progress.
            </p>
          </div>

          <button
            onClick={loadProjects}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Projects
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Projects
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {projects.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Featured Projects
            </p>

            <p className="mt-2 text-3xl font-black text-purple-600">
              {projects.filter((project) => project.featured).length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {
                projects.filter(
                  (project) =>
                    project.stage.toLowerCase() === 'completed'
                ).length
              }
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load projects
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Projects */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {loading ? (
            <div className="col-span-full rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">🚀</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No projects yet
              </h2>

              <p className="mt-2 text-slate-500">
                Projects added in Supabase will appear here.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Project Image */}
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-6xl">
                    🚀
                  </div>
                )}

                <div className="p-6">

                  {/* Title */}
                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        {project.title}
                      </h2>

                      <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-600">
                        {project.stage}
                      </span>
                    </div>

                    {project.featured && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                        ⭐ Featured
                      </span>
                    )}

                  </div>

                  {/* Description */}
                  <p className="mt-4 min-h-12 text-sm leading-6 text-slate-500">
                    {project.description || 'No description available.'}
                  </p>

                  {/* Progress */}
                  <div className="mt-5">

                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-bold text-slate-600">
                        Progress
                      </span>

                      <span className="font-black text-blue-600">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            Math.max(project.progress, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                  </div>

                  {/* Technologies */}
                  {project.technologies &&
                    project.technologies.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Details */}
                  <div className="mt-5 space-y-3 border-t pt-4">

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Student Group
                      </span>

                      <span className="font-bold text-slate-800">
                        {project.group_id
                          ? 'Assigned'
                          : 'Not assigned'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Mentor
                      </span>

                      <span className="font-bold text-slate-800">
                        {project.mentor_id
                          ? 'Assigned'
                          : 'Not assigned'}
                      </span>
                    </div>

                  </div>

                  {/* Links */}
                  {(project.github_url ||
                    project.demo_url ||
                    project.documentation_url) && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">

                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
                        >
                          GitHub →
                        </a>
                      )}

                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          Demo →
                        </a>
                      )}

                      {project.documentation_url && (
                        <a
                          href={project.documentation_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100"
                        >
                          Documentation →
                        </a>
                      )}

                    </div>
                  )}

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
