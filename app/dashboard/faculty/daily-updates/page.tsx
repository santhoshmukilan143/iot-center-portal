'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type DailyUpdate = {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  attachment_url: string | null;
  link_url: string | null;
  created_at: string;
};

export default function DailyUpdatesPage() {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUpdates() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('daily_updates')
      .select(
        'id, title, description, images, attachment_url, link_url, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setUpdates([]);
    } else {
      setUpdates(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUpdates();
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
              Daily Updates
            </h1>

            <p className="mt-2 text-slate-500">
              View daily updates and activities from the IoT Innovation Center.
            </p>
          </div>

          <button
            onClick={loadUpdates}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Updates
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Updates
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {updates.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Latest Update
            </p>

            <p className="mt-2 text-lg font-black text-blue-600">
              {updates.length > 0
                ? new Date(updates[0].created_at).toLocaleDateString()
                : '-'}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load daily updates
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Updates */}
        <div className="space-y-5">

          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading daily updates...
            </div>
          ) : updates.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">📰</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No daily updates yet
              </h2>

              <p className="mt-2 text-slate-500">
                Updates added in Supabase will appear here.
              </p>
            </div>
          ) : (
            updates.map((update) => (
              <div
                key={update.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >

                {/* Image */}
                {update.images && update.images.length > 0 && (
                  <div className="grid gap-2 p-4 md:grid-cols-3">
                    {update.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={update.title}
                        className="h-48 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="p-6">

                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">
                        {update.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {new Date(update.created_at).toLocaleString()}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700">
                      Daily Update
                    </span>
                  </div>

                  <p className="mt-4 leading-7 text-slate-600">
                    {update.description}
                  </p>

                  {/* Links */}
                  <div className="mt-5 flex flex-wrap gap-3">

                    {update.attachment_url && (
                      <a
                        href={update.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                      >
                        📎 View Attachment
                      </a>
                    )}

                    {update.link_url && (
                      <a
                        href={update.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100"
                      >
                        🔗 Open Link
                      </a>
                    )}

                  </div>

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
