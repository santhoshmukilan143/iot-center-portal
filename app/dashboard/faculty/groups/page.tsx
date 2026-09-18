'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  UserRound,
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

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
};

export default function FacultyGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [mentorId, setMentorId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select(
        'id, name, description, category, leader_id, mentor_id, created_at'
      )
      .order('created_at', { ascending: false });

    if (groupError) {
      console.error(groupError);
    } else {
      setGroups(groupData || []);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name', { ascending: true });

    if (profileError) {
      console.error(profileError);
    } else {
      setProfiles(profileData || []);
    }

    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory('');
    setLeaderId('');
    setMentorId('');
    setShowModal(true);
  }

  function openEdit(group: Group) {
    setEditingId(group.id);
    setName(group.name);
    setDescription(group.description || '');
    setCategory(group.category || '');
    setLeaderId(group.leader_id || '');
    setMentorId(group.mentor_id || '');
    setShowModal(true);
  }

  async function saveGroup() {
    if (!name.trim()) {
      alert('Please enter group name.');
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      leader_id: leaderId || null,
      mentor_id: mentorId || null,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from('groups')
        .update(payload)
        .eq('id', editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from('groups')
        .insert(payload);

      error = result.error;
    }

    if (error) {
      alert(error.message);
    } else {
      setShowModal(false);
      await loadData();
    }

    setSaving(false);
  }

  async function deleteGroup(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this group?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      await loadData();
    }
  }

  function getProfileName(id: string | null) {
    if (!id) return 'Not assigned';

    return (
      profiles.find((profile) => profile.id === id)?.full_name ||
      'Unknown user'
    );
  }

  const students = profiles.filter((profile) => {
    return profile.email?.endsWith('@ece.ritchennai.edu.in');
  });

  return (
    <DashboardShell role="faculty" title="Groups">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Groups</h2>

          <p className="mt-1 text-sm text-slate-400">
            Create and manage student research groups.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="btn border bg-white text-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={openCreate}
            className="btn bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Create Group
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Total Groups
          </p>

          <p className="mt-1 text-2xl font-black">
            {groups.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Active Groups
          </p>

          <p className="mt-1 text-2xl font-black">
            {groups.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Categories
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              new Set(
                groups
                  .map((group) => group.category)
                  .filter(Boolean)
              ).size
            }
          </p>
        </div>
      </div>

      {/* Groups */}
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
            No groups found
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Create your first student research group.
          </p>

          <button
            onClick={openCreate}
            className="btn mt-5 bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="card overflow-hidden"
            >
              <div className="bg-[#07162d] p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                    <Users size={23} />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(group)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {group.name}
                </h3>

                {group.category && (
                  <span className="mt-2 inline-block rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    {group.category}
                  </span>
                )}

                {group.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {group.description}
                  </p>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <UserRound size={17} className="text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Group Leader
                    </p>

                    <p className="text-sm font-bold">
                      {getProfileName(group.leader_id)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserRound size={17} className="text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Mentor
                    </p>

                    <p className="text-sm font-bold">
                      {getProfileName(group.mentor_id)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId ? 'Edit Group' : 'Create Group'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Enter the group details below.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="text-sm font-bold">
                  Group Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder="Example: Team Alpha"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Category
                </label>

                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder="AI / IoT / Robotics / VLSI"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input mt-2 w-full resize-none"
                  placeholder="Describe this group..."
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Group Leader
                </label>

                <select
                  value={leaderId}
                  onChange={(e) => setLeaderId(e.target.value)}
                  className="input mt-2 w-full"
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Mentor
                </label>

                <select
                  value={mentorId}
                  onChange={(e) => setMentorId(e.target.value)}
                  className="input mt-2 w-full"
                >
                  <option value="">
                    Select mentor
                  </option>

                  {profiles.map((profile) => (
                    <option
                      key={profile.id}
                      value={profile.id}
                    >
                      {profile.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                onClick={() => setShowModal(false)}
                className="btn border bg-white text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={saveGroup}
                disabled={saving}
                className="btn bg-[#07162d] text-white disabled:opacity-50"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Group'
                    : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
