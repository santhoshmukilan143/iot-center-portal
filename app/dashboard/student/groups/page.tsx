'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Users,
  UserRound,
  CalendarDays,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';

type Group = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  leader_id: string | null;
  mentor_id: string | null;
  created_at: string;
};

type Member = {
  user_id: string;
  full_name: string;
  email: string | null;
};

export default function StudentGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Record<string, Member[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: memberRows, error: memberError } = await supabase
      .from('group_members')
      .select('group_id, user_id')
      .eq('user_id', user.id);

    if (memberError || !memberRows || memberRows.length === 0) {
      setGroups([]);
      setMembers({});
      setLoading(false);
      return;
    }

    const groupIds = memberRows.map((row) => row.group_id);

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select(
        'id, name, description, category, leader_id, mentor_id, created_at'
      )
      .in('id', groupIds)
      .order('created_at', { ascending: false });

    if (groupError) {
      console.error(groupError);
      setGroups([]);
      setLoading(false);
      return;
    }

    setGroups(groupData || []);

    const { data: allMembers } = await supabase
      .from('group_members')
      .select('group_id, user_id')
      .in('group_id', groupIds);

    if (allMembers && allMembers.length > 0) {
      const userIds = allMembers.map((row) => row.user_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const grouped: Record<string, Member[]> = {};

      allMembers.forEach((row) => {
        const profile = profiles?.find(
          (item) => item.id === row.user_id
        );

        if (!grouped[row.group_id]) {
          grouped[row.group_id] = [];
        }

        if (profile) {
          grouped[row.group_id].push({
            user_id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
          });
        }
      });

      setMembers(grouped);
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
    <DashboardShell role="student" title="Groups">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">My Groups</h2>

          <p className="mt-1 text-sm text-slate-400">
            Research teams and student groups you belong to.
          </p>
        </div>

        <button
          onClick={loadGroups}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading groups...
        </div>
      ) : groups.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Users size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No group assigned
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            You will see your research group here once faculty assigns you.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="card overflow-hidden">
              <div className="bg-[#07162d] p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                    <FolderKanban size={23} />
                  </div>

                  {group.category && (
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                      {group.category}
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {group.name}
                </h3>

                {group.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {group.description}
                  </p>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  Created · {formatDate(group.created_at)}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black">Members</h4>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {members[group.id]?.length || 0}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {(members[group.id] || []).map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                      >
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-600">
                          <UserRound size={17} />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">
                            {member.full_name}
                          </div>

                          {member.email && (
                            <div className="truncate text-xs text-slate-400">
                              {member.email}
                            </div>
                          )}
                        </div>

                        {group.leader_id === member.user_id && (
                          <span className="ml-auto text-[10px] font-black uppercase text-blue-600">
                            Leader
                          </span>
                        )}
                      </div>
                    ))}

                    {(!members[group.id] ||
                      members[group.id].length === 0) && (
                      <p className="text-sm text-slate-400">
                        No members found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
