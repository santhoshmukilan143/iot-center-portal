'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  GalleryHorizontalEnd,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  ExternalLink,
} from 'lucide-react';

type GalleryItem = {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  uploaded_by: string | null;
  created_at: string;
};

const emptyForm = {
  title: '',
  image_url: '',
  category: '',
};

export default function FacultyGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  async function loadGallery() {
    setLoading(true);

    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setItems(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadGallery();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(item: GalleryItem) {
    setEditingId(item.id);

    setForm({
      title: item.title || '',
      image_url: item.image_url || '',
      category: item.category || '',
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveGalleryItem() {
    if (!form.title.trim()) {
      alert('Please enter a title.');
      return;
    }

    if (!form.image_url.trim()) {
      alert('Please enter an image URL.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        image_url: form.image_url.trim(),
        category: form.category.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('gallery')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not logged in.');
        }

        const { error } = await supabase
          .from('gallery')
          .insert({
            ...payload,
            uploaded_by: user.id,
          });

        if (error) throw error;
      }

      closeModal();
      await loadGallery();
    } catch (error: any) {
      alert(error.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGalleryItem(id: string) {
    const confirmed = confirm(
      'Are you sure you want to delete this gallery item?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadGallery();
  }

  return (
    <DashboardShell
      role="faculty"
      title="Gallery"
    >
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Gallery Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add and manage photos from the IoT Innovation Center.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadGallery}
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
            Add Image
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Total Images
          </div>

          <div className="mt-2 text-3xl font-black">
            {items.length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Categories
          </div>

          <div className="mt-2 text-3xl font-black">
            {
              new Set(
                items
                  .map((item) => item.category)
                  .filter(Boolean)
              ).size
            }
          </div>
        </div>
      </div>

      {/* Gallery */}
      <section className="card overflow-hidden">
        <div className="border-b p-5">
          <h3 className="font-extrabold">
            Gallery Images
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Images currently displayed in the portal gallery.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading gallery...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <GalleryHorizontalEnd
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold">
              No images yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Add your first gallery image.
            </p>

            <button
              onClick={openCreate}
              className="btn mx-auto mt-5 bg-[#07162d] text-white"
            >
              <Plus size={16} />
              Add Image
            </button>
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.title || 'Gallery image'}
                    className="h-full w-full object-cover"
                  />

                  {item.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-700 shadow">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="truncate font-extrabold">
                    {item.title || 'Untitled Image'}
                  </h3>

                  <div className="mt-3 flex gap-2">
                    <a
                      href={item.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-lg border text-slate-600 hover:bg-slate-100"
                      title="Open image"
                    >
                      <ExternalLink size={15} />
                    </a>

                    <button
                      onClick={() => openEdit(item)}
                      className="grid h-9 w-9 place-items-center rounded-lg border text-blue-600 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() =>
                        deleteGalleryItem(item.id)
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
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
                    ? 'Edit Gallery Image'
                    : 'Add Gallery Image'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Add image details below.
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
                  Image Title *
                </label>

                <input
                  className="input"
                  placeholder="Example: IoT Lab Visit"
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
                  Category
                </label>

                <input
                  className="input"
                  placeholder="Example: Events, Lab, Students"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">
                  Image URL *
                </label>

                <input
                  className="input"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image_url: e.target.value,
                    })
                  }
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Paste a publicly accessible image URL.
                </p>
              </div>

              {/* Preview */}
              {form.image_url && (
                <div>
                  <label className="label">
                    Preview
                  </label>

                  <div className="overflow-hidden rounded-xl border">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
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
                onClick={saveGalleryItem}
                disabled={saving}
                className="btn bg-[#07162d] text-white"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Image'
                  : 'Add Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
