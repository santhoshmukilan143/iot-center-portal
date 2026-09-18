'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  Users,
  UserRound,
} from 'lucide-react';

type Notification = {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
};

type Student = {
  id: string;
  full_name: string;
  email: string | null;
};

const emptyForm = {
  title: '',
  message: '',
  type: 'general',
  target: 'all',
  user_id: '',
};

export default function FacultyNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  async function loadNotifications() {
    setLoading(true);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setNotifications(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  async function loadStudents() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (!error) {
      setStudents(data || []);
    }
  }

  useEffect(() => {
    loadNotifications();
    loadStudents();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(notification: Notification) {
    setEditingId(notification.id);

    setForm({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'general',
      target: notification.user_id ? 'student' : 'all',
      user_id: notification.user_id || '',
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveNotification() {
    if (!form.title.trim()) {
      alert('Please enter notification title.');
      return;
    }

    if (!form.message.trim()) {
      alert('Please enter notification message.');
      return;
    }

    if (form.target === 'student' && !form.user_id) {
      alert('Please select a student.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        user_id:
          form.target === 'student'
            ? form.user_id
            : null,
        is_read: false,
      };

      if (editingId) {
        const { error } = await supabase
          .from('notifications')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        if (form.target === 'all') {
          if (students.length === 0) {
            throw new Error(
              'No students found.'
            );
          }

          const rows = students.map((student) => ({
            title: form.title.trim(),
            message: form.message.trim(),
            type: form.type,
            user_id: student.id,
            is_read: false,
          }));

          const { error } = await supabase
            .from('notifications')
            .insert(rows);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('notifications')
            .insert(payload);

          if (error) throw error;
        }
      }

      closeModal();
      await loadNotifications();
    } catch (error: any) {
      alert(
        error.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNotification(id: string) {
    const confirmed = confirm(
      'Are you sure you want to delete this notification?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadNotifications();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const uniqueRecipients = new Set(
    notifications
      .map((item) => item.user_id)
      .filter(Boolean)
  ).size;

  return (
    <DashboardShell
      role="faculty"
      title="Notifications"
    >
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Notifications Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Send notifications to students and manage portal alerts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadNotifications}
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
            Send Notification
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Total Notifications
          </div>

          <div className="mt-2 text-3xl font-black">
            {notifications.length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Unread
          </div>

          <div className="mt-2 text-3xl font-black">
            {unreadCount}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Recipients
          </div>

          <div className="mt-2 text-3xl font-black">
            {uniqueRecipients}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <section className="card overflow-hidden">
        <div className="border-b p-5">
          <h3 className="font-extrabold">
            Sent Notifications
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Notifications sent through the portal.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold">
              No notifications yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Send your first notification.
            </p>

            <button
              onClick={openCreate}
              className="btn mx-auto mt-5 bg-[#07162d] text-white"
            >
              <Plus size={16} />
              Send Notification
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-5 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Bell size={19} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold">
                          {notification.title}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500">
                          {notification.type || 'general'}
                        </span>

                        {!notification.is_read && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span>
                          {formatDate(
                            notification.created_at
                          )}
                        </span>

                        {notification.user_id ? (
                          <span className="flex items-center gap-1">
                            <UserRound size={13} />
                            Individual student
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Users size={13} />
                            All students
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() =>
                        openEdit(notification)
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-blue-600 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        deleteNotification(
                          notification.id
                        )
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Notification'
                    : 'Send Notification'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Create a notification for students.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="grid gap-4 p-5">
              <div>
                <label className="label">
                  Title *
                </label>

                <input
                  className="input"
                  placeholder="Example: New Assignment Posted"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">
                  Message *
                </label>

                <textarea
                  className="input min-h-28"
                  placeholder="Write your notification..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">
                    Type
                  </label>

                  <select
                    className="input"
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="general">
                      General
                    </option>

                    <option value="task">
                      Task
                    </option>

                    <option value="announcement">
                      Announcement
                    </option>

                    <option value="event">
                      Event
                    </option>

                    <option value="project">
                      Project
                    </option>

                    <option value="deadline">
                      Deadline
                    </option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    Send To
                  </label>

                  <select
                    className="input"
                    value={form.target}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        target: e.target.value,
                        user_id: '',
                      })
                    }
                  >
                    <option value="all">
                      All Students
                    </option>

                    <option value="student">
                      Specific Student
                    </option>
                  </select>
                </div>
              </div>

              {form.target === 'student' && (
                <div>
                  <label className="label">
                    Select Student *
                  </label>

                  <select
                    className="input"
                    value={form.user_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        user_id: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select a student
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
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t p-5">
              <button
                onClick={closeModal}
                disabled={saving}
                className="btn border bg-white text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={saveNotification}
                disabled={saving}
                className="btn bg-[#07162d] text-white"
              >
                <Save size={16} />

                {saving
                  ? 'Sending...'
                  : editingId
                  ? 'Update Notification'
                  : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
