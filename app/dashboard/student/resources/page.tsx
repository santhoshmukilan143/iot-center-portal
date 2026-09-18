'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  BookOpen,
  ExternalLink,
  FileText,
  RefreshCw,
  Download,
} from 'lucide-react';

type Resource = {
  id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
};

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoading(true);

    const { data, error } = await supabase
      .from('resources')
      .select(
        'id, title, category, description, file_url, external_url, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setResources([]);
    } else {
      setResources(data || []);
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

  return (
    <DashboardShell role="student" title="Resources">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Resources</h2>

          <p className="mt-1 text-sm text-slate-400">
            Study materials, documents, links and research resources.
          </p>
        </div>

        <button
          onClick={loadResources}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <BookOpen size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No resources available
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Resources uploaded by faculty will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <article
              key={resource.id}
              className="card flex flex-col p-5 transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen size={22} />
                </div>

                {resource.category && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                    {resource.category}
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-lg font-black">
                {resource.title || 'Untitled Resource'}
              </h3>

              {resource.description && (
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {resource.description}
                </p>
              )}

              <div className="mt-5 text-xs text-slate-400">
                Added · {formatDate(resource.created_at)}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {resource.file_url && (
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#07162d] px-4 py-2.5 text-xs font-bold text-white"
                  >
                    <Download size={15} />
                    Open File
                  </a>
                )}

                {resource.external_url && (
                  <a
                    href={resource.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
                  >
                    <ExternalLink size={15} />
                    Open Link
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
