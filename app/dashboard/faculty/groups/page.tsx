'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Group = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  leader_id: string | null;
  mentor_id: string | null;
  created_at: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadGroups() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('groups')
      .select(
        'id, name, description, category, leader_id, mentor_id, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setGroups([]);
    } else {
      setGroups(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Faculty Console
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            Groups
          </h1>

          <p className="mt-2 text-slate-500">
            Manage student teams and research groups.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Groups
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {groups.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Groups
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {groups.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Categories
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {new Set(groups.map((g) => g.category).filter(Boolean)).size}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">Unable to load groups</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Groups */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {loading ? (
            <div className="col-span-full rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-white p-10 text-center">
              <p className="font-bold text-slate-900">
                No groups found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Groups created in Supabase will appear here.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {group.name}
                    </h2>

                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {group.category || 'General'}
                    </span>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-xl">
                    👥
                  </div>

                </div>

                <p className="mt-5 min-h-12 text-sm leading-6 text-slate-500">
                  {group.description || 'No description available.'}
                </p>

                <div className="mt-6 border-t pt-4">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Student Leader
                    </span>

                    <span className="font-bold text-slate-800">
                      {group.leader_id ? 'Assigned' : 'Not assigned'}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-500">
                      Faculty Mentor
                    </span>

                    <span className="font-bold text-slate-800">
                      {group.mentor_id ? 'Assigned' : 'Not assigned'}
                    </span>
                  </div>

                </div>
              </div>
            ))
          )}

        </div>

        {/* Refresh */}
        <div className="mt-6">
          <button
            onClick={loadGroups}
            className="rounded-xl border bg-white px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ↻ Refresh Groups
          </button>
        </div>

      </div>
    </main>
  );
}
