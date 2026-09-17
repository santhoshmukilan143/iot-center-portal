
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type GalleryItem = {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  created_at: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadGallery() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('gallery')
      .select('id, title, image_url, category, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadGallery();
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
              Gallery
            </h1>

            <p className="mt-2 text-slate-500">
              View photos and activities from the IoT Innovation Center.
            </p>
          </div>

          <button
            onClick={loadGallery}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Gallery
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Photos
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {items.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Categories
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {
                new Set(
                  items
                    .map((item) => item.category)
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
              Unable to load gallery
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Gallery */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {loading ? (
            <div className="col-span-full rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading gallery...
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">🖼️</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No gallery photos yet
              </h2>

              <p className="mt-2 text-slate-500">
                Images added in Supabase will appear here.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Image */}
                <a
                  href={item.image_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={item.image_url}
                    alt={item.title || 'Gallery image'}
                    className="h-56 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </a>

                {/* Details */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <h2 className="font-black text-slate-900">
                      {item.title || 'Untitled Photo'}
                    </h2>

                    {item.category && (
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        {item.category}
                      </span>
                    )}

                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Added on{' '}
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </p>

                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block rounded-lg bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                    View Full Image →
                  </a>

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
