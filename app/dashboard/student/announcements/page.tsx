'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import { Bell, CalendarDays, RefreshCw, Megaphone } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  attachment_url: string | null;
  priority: string | null;
  created_at: string;
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);

    const { data, error } = await supabase
      .from('announcements')
      .select(
        'id, title, description, image_url, attachment_url, priority, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setAnnouncements([]);
    } else {
      setAnnouncements(data || []);
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
    <DashboardShell role="student" title="Announcements">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Announcements</h2>
          <p className="mt-1 text-sm text-slate-400">
            Important updates and notices from the faculty.
          </p>
        </div>

        <button
          onClick={loadAnnouncements}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Megaphone size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No announcements yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            New announcements posted by faculty will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {announcements.map((item) => (
            <article
              key={item.id}
              className="card overflow-hidden"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-52 w-full object-cover"
                />
              )}

              <div className="p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Bell size={20} />
                    </div>

                    <div>
                      <h3 className="text-lg font-black">
                        {item.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays size={14} />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>

                  {item.priority &&
                    item.priority.toLowerCase() !== 'normal' && (
                      <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-bold capitalize text-red-600">
                        {item.priority}
                      </span>
                    )}
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                {item.attachment_url && (
                  <a
                    href={item.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex rounded-xl bg-[#07162d] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    View Attachment
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
