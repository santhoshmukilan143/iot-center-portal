'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  GalleryHorizontalEnd,
  RefreshCw,
  CalendarDays,
  Image as ImageIcon,
} from 'lucide-react';

type GalleryItem = {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  created_at: string;
};

export default function StudentGalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    setLoading(true);

    const { data, error } = await supabase
      .from('gallery')
      .select('id, title, image_url, category, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setGallery([]);
    } else {
      setGallery(data || []);
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
    <DashboardShell role="student" title="Gallery">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Gallery</h2>

          <p className="mt-1 text-sm text-slate-400">
            Photos from research activities, events and projects.
          </p>
        </div>

        <button
          onClick={loadGallery}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading gallery...
        </div>
      ) : gallery.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <GalleryHorizontalEnd size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No gallery images yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Photos uploaded by faculty will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <article
              key={item.id}
              className="card group overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title || 'Gallery image'}
                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white/90 text-blue-600 shadow">
                  <ImageIcon size={17} />
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black">
                    {item.title || 'Untitled Image'}
                  </h3>

                  {item.category && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold capitalize text-blue-600">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  {formatDate(item.created_at)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
