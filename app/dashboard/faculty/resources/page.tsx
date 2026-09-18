'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  ExternalLink,
  FileText,
} from 'lucide-react';

type Resource = {
  id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  file_url: string | null;
  external_url: string | null;
  uploaded_by: string | null;
  created_at: string;
};

const emptyForm = {
  title: '',
  category: '',
  description: '',
  file_url: '',
  external_url: '',
};

export default function FacultyResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  async function loadResources() {
    setLoading(true);

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setResources(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadResources();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(resource: Resource) {
    setEditingId(resource.id);

    setForm({
      title: resource.title || '',
      category: resource.category || '',
      description: resource.description || '',
      file_url: resource.file_url || '',
      external_url: resource.external_url || '',
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveResource() {
    if (!form.title.trim()) {
      alert('Please enter resource title.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || null,
        description: form.description.trim() || null,
        file_url: form.file_url.trim() || null,
        external_url: form.external_url.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('resources')
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
          .from('resources')
          .insert({
            ...payload,
            uploaded_by: user.id,
          });

        if (error) throw error;
      }

      closeModal();
      await loadResources();
    } catch (error: any) {
      alert(error.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(id: string) {
    const confirmed = confirm(
      'Are you sure you want to delete this resource?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadResources();
  }

  return (
    <DashboardShell
      role="faculty"
      title="Resources"
    >
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Resources Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add and manage learning materials for students.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadResources}
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
            Add Resource
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Total Resources
          </div>

          <div className="mt-2 text-3xl font-black">
            {resources.length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Categories
          </div>

          <div className="mt-2 text-3xl font-black">
            {
              new Set(
                resources
                  .map((r) => r.category)
                  .filter(Boolean)
              ).size
            }
          </div>
        </div>
      </div>

      {/* Resource List */}
      <section className="card overflow-hidden">
        <div className="border-b p-5">
          <h3 className="font-extrabold">
            All Resources
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Learning materials available in the portal.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold">
              No resources yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Add your first learning resource.
            </p>

            <button
              onClick={openCreate}
              className="btn mx-auto mt-5 bg-[#07162d] text-white"
            >
              <Plus size={16} />
              Add Resource
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="p-5 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <FileText size={21} />
                    </div>

                    <div>
                      <h3 className="font-extrabold">
                        {resource.title || 'Untitled Resource'}
                      </h3>

                      {resource.category && (
                        <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                          {resource.category}
                        </span>
                      )}

                      {resource.description && (
                        <p className="mt-2 max-w-2xl text-sm text-slate-500">
                          {resource.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3">
                        {resource.file_url && (
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                          >
                            <FileText size={13} />
                            Open File
                          </a>
                        )}

                        {resource.external_url && (
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                          >
                            <ExternalLink size={13} />
                            Open Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {resource.file_url && (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-slate-600 hover:bg-slate-100"
                        title="Open file"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}

                    <button
                      onClick={() => openEdit(resource)}
                      className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-blue-600 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        deleteResource(resource.id)
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Resource'
                    : 'Add Resource'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Add learning material details.
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
                  Resource Title *
                </label>

                <input
                  className="input"
                  placeholder="Example: IoT Unit 1 Notes"
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
                  placeholder="Example: Notes, Research Paper, Tutorial"
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
                  Description
                </label>

                <textarea
                  className="input min-h-24"
                  placeholder="Describe this resource..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">
                  File URL
                </label>

                <input
                  className="input"
                  placeholder="https://..."
                  value={form.file_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      file_url: e.target.value,
                    })
                  }
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Add a PDF, document or file URL.
                </p>
              </div>

              <div>
                <label className="label">
                  External URL
                </label>

                <input
                  className="input"
                  placeholder="https://..."
                  value={form.external_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      external_url: e.target.value,
                    })
                  }
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Add an external website, video or learning link.
                </p>
              </div>
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
                onClick={saveResource}
                disabled={saving}
                className="btn bg-[#07162d] text-white"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Resource'
                  : 'Create Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
