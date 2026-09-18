'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  CalendarDays,
  RefreshCw,
  Target,
  UserRound,
  FileText,
} from 'lucide-react';

type Topic = {
  id: string;
  title: string;
  category: string | null;
  deadline: string | null;
  status: string;
  description: string | null;
  supervisor_id: string | null;
};

export default function StudentTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('topics')
      .select(
        'id, title, category, deadline, status, description, supervisor_id'
      )
      .or(`group_id.is.null,supervisor_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setTopics([]);
    } else {
      setTopics(data || []);
    }

    setLoading(false);
  }

  function formatDate(date: string | null) {
    if (!date) return 'No deadline';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function statusStyle(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600';

      case 'in_progress':
        return 'bg-blue-50 text-blue-600';

      case 'overdue':
        return 'bg-red-50 text-red-600';

      default:
        return 'bg-amber-50 text-amber-600';
    }
  }

  return (
    <DashboardShell role="student" title="My Topics">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">My Topics</h2>

          <p className="mt-1 text-sm text-slate-400">
            Research topics and project topics assigned to you.
          </p>
        </div>

        <button
          onClick={loadTopics}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading topics...
        </div>
      ) : topics.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Target size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No topics assigned
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Topics assigned by faculty will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="card p-5 transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Target size={21} />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(
                    topic.status
                  )}`}
                >
                  {topic.status.replaceAll('_', ' ')}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-black">
                {topic.title}
              </h3>

              {topic.category && (
                <p className="mt-2 text-xs font-bold text-blue-600">
                  Category · {topic.category}
                </p>
              )}

              {topic.description && (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {topic.description}
                </p>
              )}

              <div className="mt-5 space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} />
                  <span>
                    Deadline · {formatDate(topic.deadline)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {topic.supervisor_id ? (
                    <>
                      <UserRound size={16} />
                      <span>Faculty Supervisor Assigned</span>
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      <span>Supervisor not assigned</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
