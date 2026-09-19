'use client';

import { useEffect, useState } from 'react';
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Upload,
  FileText,
} from 'lucide-react';

import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';

type Student = {
  id: string;
  full_name: string;
  email: string | null;
};

type Group = {
  id: string;
  name: string;
};

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
  priority: string;
  attachment_url: string | null;
  marks: number | null;
  submission_type: string | null;
};

const emptyForm = {
  title: '',
  topic: '',
  description: '',
  instructions: '',
  assignment_type: 'anyone',
  assigned_to: '',
  group_id: '',
  start_date: '',
  deadline: '',
  priority: 'normal',
  marks: '',
  submission_type: 'multiple',
  attachment_url: '',
};

export default function FacultyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      { data: taskData, error: taskError },
      { data: studentData },
      { data: groupData },
    ] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('profiles')
        .select('id,full_name,email')
        .eq('role', 'student')
        .order('full_name'),

      supabase
        .from('groups')
        .select('id,name')
        .order('name'),
    ]);

    if (taskError) {
      setMessage(taskError.message);
    }

    setTasks(taskData || []);
    setStudents(studentData || []);
    setGroups(groupData || []);

    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setShowForm(true);
  }

  function openEdit(task: Task) {
    let assignmentType = 'anyone';

    if (task.assigned_to) {
      assignmentType = 'student';
    } else if (task.group_id) {
      assignmentType = 'group';
    }

    setEditingId(task.id);

    setForm({
      title: task.title || '',
      topic: task.topic || '',
      description: task.description || '',
      instructions: task.instructions || '',
      assignment_type: assignmentType,
      assigned_to: task.assigned_to || '',
      group_id: task.group_id || '',
      start_date: task.start_date || '',
      deadline: task.deadline || '',
      priority: task.priority || 'normal',
      marks: task.marks?.toString() || '',
      submission_type: task.submission_type || 'multiple',
      attachment_url: task.attachment_url || '',
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function uploadFacultyFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be below 20 MB.');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not logged in.');
      }

      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      const path =
        `tasks/${user.id}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from('portal-files')
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('portal-files')
        .getPublicUrl(path);

      setForm((previous) => ({
        ...previous,
        attachment_url: data.publicUrl,
      }));

      alert('Faculty file uploaded successfully.');
    } catch (error: any) {
      alert(
        error.message ||
          'Unable to upload faculty attachment.'
      );
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function saveTask() {
    if (!form.title.trim()) {
      setMessage('Task title is required.');
      return;
    }

    if (
      form.assignment_type === 'student' &&
      !form.assigned_to
    ) {
      setMessage('Please select a student.');
      return;
    }

    if (
      form.assignment_type === 'group' &&
      !form.group_id
    ) {
      setMessage('Please select a group.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not logged in.');
      }

      let assignedTo: string | null = null;
      let groupId: string | null = null;

      if (form.assignment_type === 'student') {
        assignedTo = form.assigned_to;
      }

      if (form.assignment_type === 'group') {
        groupId = form.group_id;
      }

      const payload = {
        title: form.title.trim(),
        topic: form.topic.trim() || null,
        description: form.description.trim() || null,
        instructions:
          form.instructions.trim() || null,

        assigned_by: user.id,

        assigned_to: assignedTo,
        group_id: groupId,

        start_date:
          form.start_date || null,

        deadline:
          form.deadline || null,

        priority: form.priority,

        marks:
          form.marks
            ? Number(form.marks)
            : null,

        submission_type:
          form.submission_type,

        attachment_url:
          form.attachment_url || null,
      };

      let error;

      if (editingId) {
        const result = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', editingId);

        error = result.error;
      } else {
        const result = await supabase
          .from('tasks')
          .insert(payload);

        error = result.error;
      }

      if (error) throw error;

      alert(
        editingId
          ? 'Task updated successfully.'
          : 'Task created successfully.'
      );

      closeForm();
      await loadData();
    } catch (error: any) {
      setMessage(
        error.message ||
          'Unable to save task.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(id: string) {
    const ok = window.confirm(
      'Delete this task?'
    );

    if (!ok) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadData();
  }

  function assignmentLabel(task: Task) {
    if (task.assigned_to) {
      const student = students.find(
        (item) => item.id === task.assigned_to
      );

      return student?.full_name || 'Student';
    }

    if (task.group_id) {
      const group = groups.find(
        (item) => item.id === task.group_id
      );

      return group?.name || 'Group';
    }

    return 'Anyone / General';
  }

  return (
    <DashboardShell
      role="faculty"
      title="Tasks"
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-2xl font-black">
              Tasks
            </h2>

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
              <Plus size={16} />
              Create Task
            </button>

          </div>
        </div>

        {message && (
          <div className="rounded-xl border bg-white p-4 text-sm font-semibold text-red-600">
            {message}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <section className="card p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Task'
                    : 'Create Task'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Assign work to anyone, a student or a group.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="grid h-9 w-9 place-items-center rounded-xl border"
              >
                <X size={17} />
              </button>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Title */}
              <div className="md:col-span-2">
                <label className="label">
                  Task Title *
                </label>

                <input
                  className="input"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter task title"
                />
              </div>

              {/* Topic */}
              <div>
                <label className="label">
                  Topic
                </label>

                <input
                  className="input"
                  value={form.topic}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      topic: e.target.value,
                    })
                  }
                  placeholder="IoT / AI / Embedded"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="label">
                  Priority
                </label>

                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value,
                    })
                  }
                >
                  <option value="normal">
                    Normal
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="urgent">
                    Urgent
                  </option>
                </select>
              </div>

              {/* Assignment */}
              <div className="md:col-span-2">

                <label className="label">
                  Assign To *
                </label>

                <select
                  className="input"
                  value={form.assignment_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      assignment_type: e.target.value,
                      assigned_to: '',
                      group_id: '',
                    })
                  }
                >
                  <option value="anyone">
                    Anyone / General — All Students
                  </option>

                  <option value="student">
                    Specific Student
                  </option>

                  <option value="group">
                    Specific Group
                  </option>
                </select>

              </div>

              {/* Student */}
              {form.assignment_type ===
                'student' && (
                <div className="md:col-span-2">

                  <label className="label">
                    Select Student
                  </label>

                  <select
                    className="input"
                    value={form.assigned_to}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        assigned_to: e.target.value,
                      })
                    }
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
                        {student.email
                          ? ` — ${student.email}`
                          : ''}
                      </option>
                    ))}
                  </select>

                </div>
              )}

              {/* Group */}
              {form.assignment_type ===
                'group' && (
                <div className="md:col-span-2">

                  <label className="label">
                    Select Group
                  </label>

                  <select
                    className="input"
                    value={form.group_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        group_id: e.target.value,
                      })
                    }
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
              )}

              {/* Description */}
              <div className="md:col-span-2">

                <label className="label">
                  Description
                </label>

                <textarea
                  className="input min-h-28"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the task..."
                />

              </div>

              {/* Instructions */}
              <div className="md:col-span-2">

                <label className="label">
                  Instructions
                </label>

                <textarea
                  className="input min-h-32"
                  value={form.instructions}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      instructions: e.target.value,
                    })
                  }
                  placeholder="Explain exactly what students need to do..."
                />

              </div>

              {/* Start */}
              <div>
                <label className="label">
                  Start Date
                </label>

                <input
                  type="date"
                  className="input"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      start_date: e.target.value,
                    })
                  }
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="label">
                  Deadline
                </label>

                <input
                  type="date"
                  className="input"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deadline: e.target.value,
                    })
                  }
                />
              </div>

              {/* Marks */}
              <div>
                <label className="label">
                  Maximum Marks
                </label>

                <input
                  type="number"
                  min="0"
                  className="input"
                  value={form.marks}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      marks: e.target.value,
                    })
                  }
                  placeholder="100"
                />
              </div>

              {/* Submission type */}
              <div>
                <label className="label">
                  Submission Type
                </label>

                <select
                  className="input"
                  value={form.submission_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      submission_type: e.target.value,
                    })
                  }
                >
                  <option value="multiple">
                    File + Link + Text
                  </option>

                  <option value="file">
                    File Only
                  </option>

                  <option value="link">
                    Link Only
                  </option>

                  <option value="text">
                    Text Only
                  </option>
                </select>
              </div>

              {/* Faculty File */}
              <div className="md:col-span-2">

                <label className="label">
                  Faculty Attachment
                </label>

                <div className="rounded-xl border border-dashed p-5">

                  <label className="flex cursor-pointer items-center gap-3">

                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      {uploading ? (
                        <RefreshCw
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Upload size={18} />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold">
                        {uploading
                          ? 'Uploading...'
                          : 'Upload Task File'}
                      </div>

                      <div className="text-xs text-slate-400">
                        PDF, DOC, PPT, ZIP, images etc. · Max 20 MB
                      </div>
                    </div>

                    <input
                      type="file"
                      className="hidden"
                      onChange={uploadFacultyFile}
                      disabled={uploading}
                    />

                  </label>

                  {form.attachment_url && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-semibold text-green-700">

                      <FileText size={15} />

                      Faculty attachment uploaded

                    </div>
                  )}

                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-5">

              <button
                onClick={closeForm}
                className="btn border bg-white"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={saveTask}
                className="btn bg-[#07162d] text-white"
                disabled={saving || uploading}
              >
                {saving ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <CheckSquare size={16} />
                )}

                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Task'
                  : 'Create Task'}
              </button>

            </div>

          </section>
        )}

        {/* Tasks */}
        {loading ? (
          <div className="card p-10 text-center text-slate-400">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckSquare
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-black">
              No tasks yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Create your first task.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {tasks.map((task) => (
              <div
                key={task.id}
                className="card p-5"
              >

                <div className="flex flex-col justify-between gap-5 md:flex-row">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-lg font-black">
                        {task.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          task.priority === 'urgent'
                            ? 'bg-red-50 text-red-600'
                            : task.priority === 'high'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>

                    </div>

                    {task.topic && (
                      <div className="mt-2 text-xs font-bold text-blue-600">
                        Topic · {task.topic}
                      </div>
                    )}

                    {task.description && (
                      <p className="mt-3 text-sm text-slate-500">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">

                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {assignmentLabel(task)}
                      </span>

                      {task.attachment_url && (
                        <a
                          href={task.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700"
                        >
                          <FileText size={13} />
                          Attachment
                        </a>
                      )}

                    </div>

                  </div>

                  <div className="flex shrink-0 gap-2">

                    <button
                      onClick={() =>
                        openEdit(task)
                      }
                      className="grid h-10 w-10 place-items-center rounded-xl border"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(task.id)
                      }
                      className="grid h-10 w-10 place-items-center rounded-xl border text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </DashboardShell>
  );
}
