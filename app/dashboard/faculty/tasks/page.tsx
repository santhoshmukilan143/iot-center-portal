'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  CheckSquare,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  CalendarDays,
  Users,
  UserRound,
} from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  instructions: string | null;
  assigned_to: string | null;
  group_id: string | null;
  start_date: string | null;
  deadline: string | null;
  priority: string | null;
  marks: number | null;
  submission_type: string | null;
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

export default function FacultyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [groupId, setGroupId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('normal');
  const [marks, setMarks] = useState('');
  const [submissionType, setSubmissionType] = useState('multiple');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select(
        'id, title, description, topic, instructions, assigned_to, group_id, start_date, deadline, priority, marks, submission_type, created_at'
      )
      .order('created_at', { ascending: false });

    if (taskError) {
      console.error(taskError);
      setTasks([]);
    } else {
      setTasks(taskData || []);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
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
    setDescription('');
    setTopic('');
    setInstructions('');
    setAssignedTo('');
    setGroupId('');
    setStartDate('');
    setDeadline('');
    setPriority('normal');
    setMarks('');
    setSubmissionType('multiple');
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(task: Task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setTopic(task.topic || '');
    setInstructions(task.instructions || '');
    setAssignedTo(task.assigned_to || '');
    setGroupId(task.group_id || '');
    setStartDate(task.start_date || '');
    setDeadline(task.deadline || '');
    setPriority(task.priority || 'normal');
    setMarks(
      task.marks !== null && task.marks !== undefined
        ? String(task.marks)
        : ''
    );
    setSubmissionType(task.submission_type || 'multiple');
    setShowModal(true);
  }

  async function saveTask() {
    if (!title.trim()) {
      alert('Please enter task title.');
      return;
    }

    if (!deadline) {
      alert('Please select a deadline.');
      return;
    }

    if (assignedTo && groupId) {
      alert('Select either a student or a group, not both.');
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Please login again.');
      setSaving(false);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      topic: topic.trim() || null,
      instructions: instructions.trim() || null,
      assigned_by: user.id,
      assigned_to: assignedTo || null,
      group_id: groupId || null,
      start_date: startDate || null,
      deadline,
      priority,
      attachment_url: null,
      reference_links: [],
      marks: marks ? Number(marks) : null,
      submission_type: submissionType,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from('tasks')
        .update({
          title: payload.title,
          description: payload.description,
          topic: payload.topic,
          instructions: payload.instructions,
          assigned_to: payload.assigned_to,
          group_id: payload.group_id,
          start_date: payload.start_date,
          deadline: payload.deadline,
          priority: payload.priority,
          marks: payload.marks,
          submission_type: payload.submission_type,
        })
        .eq('id', editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from('tasks')
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

  async function deleteTask(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      await loadData();
    }
  }

  function getStudentName(id: string | null) {
    if (!id) return null;

    return (
      profiles.find((profile) => profile.id === id)?.full_name ||
      'Unknown student'
    );
  }

  function getGroupName(id: string | null) {
    if (!id) return null;

    return (
      groups.find((group) => group.id === id)?.name ||
      'Unknown group'
    );
  }

  function formatDate(date: string | null) {
    if (!date) return 'Not set';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <DashboardShell role="faculty" title="Tasks">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Tasks</h2>

          <p className="mt-1 text-sm text-slate-400">
            Create, assign and manage student tasks.
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
            Create Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-slate-400">Total Tasks</p>
          <p className="mt-1 text-2xl font-black">
            {tasks.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">High Priority</p>
          <p className="mt-1 text-2xl font-black">
            {
              tasks.filter(
                (task) => task.priority === 'high'
              ).length
            }
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">Upcoming</p>
          <p className="mt-1 text-2xl font-black">
            {
              tasks.filter(
                (task) =>
                  task.deadline &&
                  new Date(`${task.deadline}T23:59:59`) >=
                    new Date()
              ).length
            }
          </p>
        </div>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <CheckSquare size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No tasks yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Create your first task for students.
          </p>

          <button
            onClick={openCreate}
            className="btn mt-5 bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="card p-5"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <CheckSquare size={20} />
                    </div>

                    <h3 className="text-lg font-black">
                      {task.title}
                    </h3>

                    {task.priority &&
                      task.priority !== 'normal' && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold capitalize text-red-600">
                          {task.priority}
                        </span>
                      )}
                  </div>

                  {task.topic && (
                    <p className="mt-3 text-xs font-bold text-blue-600">
                      Topic · {task.topic}
                    </p>
                  )}

                  {task.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    {task.assigned_to && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                        <UserRound size={14} />
                        {getStudentName(task.assigned_to)}
                      </span>
                    )}

                    {task.group_id && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                        <Users size={14} />
                        {getGroupName(task.group_id)}
                      </span>
                    )}

                    {!task.assigned_to &&
                      !task.group_id && (
                        <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600">
                          Not assigned
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 lg:min-w-56">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      Deadline
                    </div>

                    <p className="mt-1 text-sm font-black">
                      {formatDate(task.deadline)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(task)}
                      className="btn flex-1 border bg-white text-slate-700"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="grid h-10 w-10 place-items-center rounded-xl border text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId ? 'Edit Task' : 'Create Task'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Assign academic work to a student or group.
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
                  Task Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder="Example: Build ESP32 monitoring system"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold">
                    Topic
                  </label>

                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="input mt-2 w-full"
                    placeholder="IoT / AI / VLSI"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                  rows={3}
                  className="input mt-2 w-full resize-none"
                  placeholder="Describe the task..."
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Instructions
                </label>

                <textarea
                  value={instructions}
                  onChange={(e) =>
                    setInstructions(e.target.value)
                  }
                  rows={4}
                  className="input mt-2 w-full resize-none"
                  placeholder="Detailed instructions for students..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold">
                    Assign to Student
                  </label>

                  <select
                    value={assignedTo}
                    onChange={(e) => {
                      setAssignedTo(e.target.value);
                      if (e.target.value) setGroupId('');
                    }}
                    className="input mt-2 w-full"
                  >
                    <option value="">
                      No individual student
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

                <div>
                  <label className="text-sm font-bold">
                    Assign to Group
                  </label>

                  <select
                    value={groupId}
                    onChange={(e) => {
                      setGroupId(e.target.value);
                      if (e.target.value) setAssignedTo('');
                    }}
                    className="input mt-2 w-full"
                  >
                    <option value="">
                      No group
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
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-bold">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                    className="input mt-2 w-full"
                  />
                </div>

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
                    Marks
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={marks}
                    onChange={(e) =>
                      setMarks(e.target.value)
                    }
                    className="input mt-2 w-full"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Submission Type
                </label>

                <select
                  value={submissionType}
                  onChange={(e) =>
                    setSubmissionType(e.target.value)
                  }
                  className="input mt-2 w-full"
                >
                  <option value="multiple">
                    Multiple / File + Text
                  </option>
                  <option value="file">File Upload</option>
                  <option value="text">Text Submission</option>
                  <option value="link">Link Submission</option>
                </select>
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
                onClick={saveTask}
                disabled={saving}
                className="btn bg-[#07162d] text-white disabled:opacity-50"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Task'
                    : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
