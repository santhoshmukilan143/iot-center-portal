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
  Megaphone,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  attachment_url: string | null;
  priority: string | null;
  target_type: string | null;
  created_at: string;
};

export default function FacultyAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [priority, setPriority] = useState('normal');
  const [targetType, setTargetType] = useState('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);

    const { data, error } = await supabase
      .from('announcements')
      .select(
        'id, title, description, image_url, attachment_url, priority, target_type, created_at'
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

  function resetForm() {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setAttachmentUrl('');
    setPriority('normal');
    setTargetType('all');
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(item: Announcement) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImageUrl(item.image_url || '');
    setAttachmentUrl(item.attachment_url || '');
    setPriority(item.priority || 'normal');
    setTargetType(item.target_type || 'all');
    setShowModal(true);
  }

  async function saveAnnouncement() {
    if (!title.trim()) {
      alert('Please enter announcement title.');
      return;
    }

    if (!description.trim()) {
      alert('Please enter announcement description.');
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
      description: description.trim(),
      image_url: imageUrl.trim() || null,
      attachment_url: attachmentUrl.trim() || null,
      priority,
      target_type: targetType,
      posted_by: user.id,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from('announcements')
        .update({
          title: payload.title,
          description: payload.description,
          image_url: payload.image_url,
          attachment_url: payload.attachment_url,
          priority: payload.priority,
          target_type: payload.target_type,
        })
        .eq('id', editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from('announcements')
        .insert(payload);

      error = result.error;
    }

    if (error) {
      alert(error.message);
    } else {
      setShowModal(false);
      resetForm();
      await loadAnnouncements();
    }

    setSaving(false);
  }

  async function deleteAnnouncement(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this announcement?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      await loadAnnouncements();
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <DashboardShell role="faculty" title="Announcements">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Announcements</h2>

          <p className="mt-1 text-sm text-slate-400">
            Create and manage announcements for students.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadAnnouncements}
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
            Create Announcement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Total Announcements
          </p>

          <p className="mt-1 text-2xl font-black">
            {announcements.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            High Priority
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              announcements.filter(
                (item) =>
                  item.priority?.toLowerCase() === 'high'
              ).length
            }
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            For All Students
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              announcements.filter(
                (item) => item.target_type === 'all'
              ).length
            }
          </p>
        </div>
      </div>

      {/* List */}
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
            Create your first announcement for students.
          </p>

          <button
            onClick={openCreate}
            className="btn mt-5 bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Create Announcement
          </button>
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
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
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

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                      {item.target_type || 'all'}
                    </span>

                    {item.priority &&
                      item.priority !== 'normal' && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold capitalize text-red-600">
                          {item.priority}
                        </span>
                      )}

                    <button
                      onClick={() => openEdit(item)}
                      className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => deleteAnnouncement(item.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                {item.attachment_url && (
                  <a
                    href={item.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#07162d] px-4 py-2.5 text-xs font-bold text-white"
                  >
                    View Attachment
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Announcement'
                    : 'Create Announcement'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  This announcement will be visible to students.
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
                  Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder="Announcement title"
                />
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
                  placeholder="Write your announcement..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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

                <div>
                  <label className="text-sm font-bold">
                    Target
                  </label>

                  <select
                    value={targetType}
                    onChange={(e) =>
                      setTargetType(e.target.value)
                    }
                    className="input mt-2 w-full"
                  >
                    <option value="all">All Students</option>
                    <option value="group">Specific Group</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Image URL
                </label>

                <input
                  value={imageUrl}
                  onChange={(e) =>
                    setImageUrl(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Attachment URL
                </label>

                <input
                  value={attachmentUrl}
                  onChange={(e) =>
                    setAttachmentUrl(e.target.value)
                  }
                  className="input mt-2 w-full"
                  placeholder="https://..."
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
                onClick={saveAnnouncement}
                disabled={saving}
                className="btn bg-[#07162d] text-white disabled:opacity-50"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Announcement'
                    : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
