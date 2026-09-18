'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Wifi,
} from 'lucide-react';

type DailyUpdate = {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  attachment_url: string | null;
  link_url: string | null;
  created_at: string;
};

export default function StudentDailyUpdatesPage() {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    setLoading(true);

    const { data, error } = await supabase
      .from('daily_updates')
      .select(
        'id, title, description, images, attachment_url, link_url, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setUpdates([]);
    } else {
      setUpdates(data || []);
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
    <DashboardShell role="student" title="Daily Updates">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Daily Updates</h2>

          <p className="mt-1 text-sm text-slate-400">
            Latest research center activities and updates.
          </p>
        </div>

        <button
          onClick={loadUpdates}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading daily updates...
        </div>
      ) : updates.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Wifi size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No daily updates yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            New updates posted by faculty will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {updates.map((item) => (
            <article
              key={item.id}
              className="card overflow-hidden"
            >
              {/* Images */}
              {item.images && item.images.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {item.images.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="h-48 w-full object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="p-5">
                <div className="flex gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Wifi size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-black">
                      {item.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {item.attachment_url && (
                    <a
                      href={item.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#07162d] px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <FileText size={16} />
                      View Attachment
                    </a>
                  )}

                  {item.link_url && (
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
                    >
                      <ExternalLink size={16} />
                      Open Link
                    </a>
                  )}
                </div>

                {item.images && item.images.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <ImageIcon size={14} />
                    {item.images.length} image
                    {item.images.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
