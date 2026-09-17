'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Resource = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadResources() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('resources')
      .select(
        'id, title, category, description, file_url, external_url, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setResources([]);
    } else {
      setResources(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadResources();
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
              Resources
            </h1>

            <p className="mt-2 text-slate-500">
              Access study materials, documents and useful resources.
            </p>
          </div>

          <button
            onClick={loadResources}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Resources
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Resources
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {resources.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Categories
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {
                new Set(
                  resources
                    .map((resource) => resource.category)
                    .filter(Boolean)
                ).size
              }
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load resources
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Resources */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {loading ? (
            <div className="col-span-full rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading resources...
            </div>
          ) : resources.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">📚</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No resources yet
              </h2>

              <p className="mt-2 text-slate-500">
                Resources added in Supabase will appear here.
              </p>
            </div>
          ) : (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Icon + Category */}
                <div className="flex items-start justify-between gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    📚
                  </div>

                  {resource.category && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {resource.category}
                    </span>
                  )}

                </div>

                {/* Title */}
                <h2 className="mt-5 text-xl font-black text-slate-900">
                  {resource.title}
                </h2>

                {/* Description */}
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
                  {resource.description || 'No description available.'}
                </p>

                {/* Date */}
                <p className="mt-4 text-xs text-slate-400">
                  Added on{' '}
                  {new Date(
                    resource.created_at
                  ).toLocaleDateString()}
                </p>

                {/* Links */}
                {(resource.file_url || resource.external_url) && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">

                    {resource.file_url && (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        📄 Open File
                      </a>
                    )}

                    {resource.external_url && (
                      <a
                        href={resource.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                      >
                        🔗 External Link
                      </a>
                    )}

                  </div>
                )}

              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
