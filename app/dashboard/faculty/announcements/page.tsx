'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Announcement = {
  id: string;
  title: string;
  description: string;
  priority: string | null;
  target_type: string | null;
  attachment_url: string | null;
  created_at: string;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAnnouncements() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('announcements')
      .select(
        'id, title, description, priority, target_type, attachment_url, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setAnnouncements([]);
    } else {
      setAnnouncements(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Faculty Console
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Announcements
            </h1>

            <p className="mt-2 text-slate-500">
              Publish important updates and notices for students.
            </p>
          </div>

          <button
            onClick={loadAnnouncements}
            className="rounded-xl border bg-white px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Announcements
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {announcements.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              High Priority
            </p>

            <p className="mt-2 text-3xl font-black text-red-600">
              {
                announcements.filter(
                  (a) => a.priority?.toLowerCase() === 'high'
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              For All
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {
                announcements.filter(
                  (a) =>
                    !a.target_type ||
                    a.target_type.toLowerCase() === 'all'
                ).length
              }
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load announcements
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* List */}
        <div className="space-y-4">

          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">📢</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No announcements yet
              </h2>

              <p className="mt-2 text-slate-500">
                Announcements created in Supabase will appear here.
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                      📢
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">
                          {announcement.title}
                        </h2>

                        {announcement.priority && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              announcement.priority.toLowerCase() === 'high'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {announcement.priority}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 leading-7 text-slate-600">
                        {announcement.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-sm text-slate-500">
                    {new Date(
                      announcement.created_at
                    ).toLocaleDateString()}
                  </div>

                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">

                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                    Target: {announcement.target_type || 'All'}
                  </span>

                  {announcement.attachment_url && (
                    <a
                      href={announcement.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
                    >
                      View Attachment →
                    </a>
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
