'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Topic = {
  id: string;
  title: string;
  category: string | null;
  group_id: string | null;
  supervisor_id: string | null;
  deadline: string | null;
  status: string;
  description: string | null;
  created_at: string;
};

export default function TopicAssignmentPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTopics() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('topics')
      .select(
        'id, title, category, group_id, supervisor_id, deadline, status, description, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setTopics([]);
    } else {
      setTopics(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTopics();
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
              Topic Assignment
            </h1>

            <p className="mt-2 text-slate-500">
              Manage research topics assigned to student groups.
            </p>
          </div>

          <button
            onClick={loadTopics}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Topics
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Topics
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {topics.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Assigned Topics
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {topics.filter((topic) => topic.group_id).length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Topics
            </p>

            <p className="mt-2 text-3xl font-black text-orange-500">
              {
                topics.filter(
                  (topic) => topic.status.toLowerCase() === 'pending'
                ).length
              }
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load topics
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Topics */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {loading ? (
            <div className="col-span-full rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading topics...
            </div>
          ) : topics.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">📚</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No topics assigned yet
              </h2>

              <p className="mt-2 text-slate-500">
                Topics added in Supabase will appear here.
              </p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Title */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {topic.title}
                    </h2>

                    {topic.category && (
                      <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                        {topic.category}
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-xl">
                    📚
                  </div>
                </div>

                {/* Description */}
                <p className="mt-5 min-h-12 text-sm leading-6 text-slate-500">
                  {topic.description || 'No description available.'}
                </p>

                {/* Details */}
                <div className="mt-5 space-y-3 border-t pt-4">

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Student Group
                    </span>

                    <span className="font-bold text-slate-800">
                      {topic.group_id ? 'Assigned' : 'Not assigned'}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Supervisor
                    </span>

                    <span className="font-bold text-slate-800">
                      {topic.supervisor_id ? 'Assigned' : 'Not assigned'}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        topic.status.toLowerCase() === 'pending'
                          ? 'bg-orange-100 text-orange-700'
                          : topic.status.toLowerCase() === 'reviewed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {topic.status}
                    </span>
                  </div>

                  {topic.deadline && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-slate-500">
                        Deadline
                      </span>

                      <span className="font-bold text-slate-800">
                        {new Date(topic.deadline).toLocaleDateString()}
                      </span>
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
