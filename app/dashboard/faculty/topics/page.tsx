'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  CalendarDays,
  UserRound,
} from 'lucide-react';

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

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
};

type Group = {
  id: string;
  name: string;
};

export default function FacultyTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [groupId, setGroupId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('pending');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select(
        'id, title, category, group_id, supervisor_id, deadline, status, description, created_at'
      )
      .order('created_at', { ascending: false });

    if (topicError) {
      console.error(topicError);
      setTopics([]);
    } else {
      setTopics(topicData || []);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('role', ['faculty', 'admin'])
      .order('full_name', { ascending: true });

    if (profileError) {
      console.error(profileError);
    } else {
      setProfiles(profileData || []);
    }

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .order('name', { ascending: true });

    if (groupError) {
      console.error(groupError);
    } else {
      setGroups(groupData || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle('');
    setCategory('');
    setGroupId('');
    setSupervisorId('');
    setDeadline('');
    setStatus('pending');
    setDescription('');
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(topic: Topic) {
    setEditingId(topic.id);
    setTitle(topic.title);
    setCategory(topic.category || '');
    setGroupId(topic.group_id || '');
    setSupervisorId(topic.supervisor_id || '');
    setDeadline(topic.deadline || '');
    setStatus(topic.status || 'pending');
    setDescription(topic.description || '');
    setShowModal(true);
  }

  async function saveTopic() {
    if (!title.trim()) {
      alert('Please enter topic title.');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      category: category.trim() || null,
      group_id: groupId || null,
      supervisor_id: supervisorId || null,
      deadline: deadline || null,
      status,
      description: description.trim() || null,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from('topics')
        .update(payload)
        .eq('id', editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from('topics')
        .insert(payload);

      error = result.error;
    }

    if (error) {
      alert(error.message);
    } else {
      setShowModal(false);
      resetForm();
      await loadData();
    }

    setSaving(false);
  }

  async function deleteTopic(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this topic?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      await loadData();
    }
  }

  function getName(id: string | null) {
    if (!id) return 'Not assigned';

    return (
      profiles.find((profile) => profile.id === id)?.full_name ||
      'Unknown'
    );
  }

  function getGroupName(id: string | null) {
    if (!id) return 'No group';

    return (
      groups.find((group) => group.id === id)?.name ||
      'Unknown group'
    );
  }

  function formatDate(date: string | null) {
    if (!date) return 'No deadline';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function statusStyle(value: string) {
    if (value === 'completed') {
      return 'bg-green-50 text-green-600';
    }

    if (value === 'in_progress') {
      return 'bg-blue-50 text-blue-600';
    }

    if (value === 'overdue') {
      return 'bg-red-50 text-red-600';
    }

    return 'bg-amber-50 text-amber-600';
  }

  return (
    <DashboardShell role="faculty" title="Topic Assignment">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Topic Assignment
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Create and assign research topics to student groups.
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
            Create Topic
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Total Topics
          </p>

          <p className="mt-1 text-2xl font-black">
            {topics.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Pending
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              topics.filter(
                (topic) => topic.status === 'pending'
              ).length
            }
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            In Progress
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              topics.filter(
                (topic) => topic.status === 'in_progress'
              ).length
            }
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Completed
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              topics.filter(
                (topic) => topic.status === 'completed'
              ).length
            }
          </p>
        </div>
      </div>

      {/* Topics */}
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
            No topics found
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Create your first research topic.
          </p>

          <button
            onClick={openCreate}
            className="btn mt-5 bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Create Topic
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {topics.map((topic) => (
            <article
              key={topic.id}
              className="card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Target size={21} />
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(
                      topic.status
                    )}`}
                  >
                    {topic.status.replaceAll('_', ' ')}
                  </span>

                  <button
                    onClick={() => openEdit(topic)}
                    className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-slate-50"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="grid h-9 w-9 place-items-center rounded-lg border text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
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
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <UserRound size={16} />
                  <span>
                    Supervisor · {getName(topic.supervisor_id)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Target size={16} />
                  <span>
                    Group · {getGroupName(topic.group_id)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <CalendarDays size={16} />
                  <span>
                    Deadline · {formatDate(topic.deadline)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Topic'
                    : 'Create Topic'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Add research topic details.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="text-sm font-bold">
                  Topic Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder="Research topic title"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Category
                </label>

                <input
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="AI / IoT / Robotics / VLSI"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold">
                    Student Group
                  </label>

                  <select
                    value={groupId}
                    onChange={(e) =>
                      setGroupId(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="">
                      Select group
                    </option>

                    {groups.map((group) => (
                      <option
                        key={group.id}
                        value={group.id}
                      >
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Supervisor
                  </label>

                  <select
                    value={supervisorId}
                    onChange={(e) =>
                      setSupervisorId(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="">
                      Select supervisor
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) =>
                      setDeadline(e.target.value)
                    }
                    className="input mt-2 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="overdue">
                      Overdue
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={5}
                  className="input mt-2 w-full resize-none"
                  placeholder="Describe the research topic..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="btn border bg-white text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={saveTopic}
                disabled={saving}
                className="btn bg-[#07162d] text-white disabled:opacity-50"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Topic'
                    : 'Create Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
