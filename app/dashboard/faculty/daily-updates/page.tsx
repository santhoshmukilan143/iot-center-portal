'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Wifi,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

type DailyUpdate = {
  id: string;
  title: string;
  description: string;
  images: string[] | null;
  attachment_url: string | null;
  link_url: string | null;
  created_at: string;
};

export default function FacultyDailyUpdatesPage() {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    setLoading(true);

    const { data, error } = await supabase
      .from('daily_updates')
      .select(
        'id, title, description, images, attachment_url, link_url, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setUpdates([]);
    } else {
      setUpdates(data || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setImages('');
    setAttachmentUrl('');
    setLinkUrl('');
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(item: DailyUpdate) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImages(item.images?.join('\n') || '');
    setAttachmentUrl(item.attachment_url || '');
    setLinkUrl(item.link_url || '');
    setShowModal(true);
  }

  async function saveUpdate() {
    if (!title.trim()) {
      alert('Please enter update title.');
      return;
    }

    if (!description.trim()) {
      alert('Please enter update description.');
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

    const imageList = images
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      images: imageList,
      attachment_url: attachmentUrl.trim() || null,
      link_url: linkUrl.trim() || null,
      posted_by: user.id,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from('daily_updates')
        .update({
          title: payload.title,
          description: payload.description,
          images: payload.images,
          attachment_url: payload.attachment_url,
          link_url: payload.link_url,
        })
        .eq('id', editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from('daily_updates')
        .insert(payload);

      error = result.error;
    }

    if (error) {
      alert(error.message);
    } else {
      setShowModal(false);
      resetForm();
      await loadUpdates();
    }

    setSaving(false);
  }

  async function deleteUpdate(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this daily update?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('daily_updates')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      await loadUpdates();
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
    <DashboardShell role="faculty" title="Daily Updates">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Daily Updates
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Post and manage research center activities and updates.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadUpdates}
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
            Add Update
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs text-slate-400">
            Total Updates
          </p>

          <p className="mt-1 text-2xl font-black">
            {updates.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-400">
            With Images
          </p>

          <p className="mt-1 text-2xl font-black">
            {
              updates.filter(
                (item) =>
                  item.images && item.images.length > 0
              ).length
            }
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading daily updates...
        </div>
      ) : updates.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Wifi size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No daily updates yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Create your first research center update.
          </p>

          <button
            onClick={openCreate}
            className="btn mt-5 bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Add Update
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {updates.map((item) => (
            <article
              key={item.id}
              className="card overflow-hidden"
            >
              {/* Images */}
              {item.images && item.images.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {item.images.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="h-48 w-full object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="flex gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
                      <Wifi size={20} />
                    </div>

                    <div>
                      <h3 className="text-lg font-black">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => deleteUpdate(item.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.attachment_url && (
                    <a
                      href={item.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#07162d] px-4 py-2.5 text-xs font-bold text-white"
                    >
                      <ExternalLink size={14} />
                      Attachment
                    </a>
                  )}

                  {item.link_url && (
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
                    >
                      <ExternalLink size={14} />
                      Open Link
                    </a>
                  )}

                  {item.images && item.images.length > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500">
                      <ImageIcon size={14} />
                      {item.images.length} image
                      {item.images.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Daily Update'
                    : 'Add Daily Update'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Share an update with students.
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
                  placeholder="Update title"
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
                  placeholder="Write the update..."
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Image URLs
                </label>

                <textarea
                  value={images}
                  onChange={(e) => setImages(e.target.value)}
                  rows={3}
                  className="input mt-2 w-full resize-none"
                  placeholder={'One image URL per line'}
                />

                <p className="mt-1 text-xs text-slate-400">
                  Add one image URL per line.
                </p>
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

              <div>
                <label className="text-sm font-bold">
                  External Link
                </label>

                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
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
                onClick={saveUpdate}
                disabled={saving}
                className="btn bg-[#07162d] text-white disabled:opacity-50"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update'
                    : 'Create Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
