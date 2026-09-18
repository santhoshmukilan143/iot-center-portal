'use client';

import { useEffect, useState } from 'react';
import {
  UserRound,
  Save,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';

export default function FacultyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    department: '',
    designation: '',
    bio: '',
    github: '',
    linkedin: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'full_name,email,department,designation,bio,github,linkedin'
      )
      .eq('id', user.id)
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      setForm({
        full_name: data?.full_name || '',
        email: data?.email || user.email || '',
        department: data?.department || '',
        designation: data?.designation || '',
        bio: data?.bio || '',
        github: data?.github || '',
        linkedin: data?.linkedin || '',
      });
    }

    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('User not logged in.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        department: form.department,
        designation: form.designation,
        bio: form.bio,
        github: form.github,
        linkedin: form.linkedin,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Profile updated successfully.');
    }

    setSaving(false);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <DashboardShell role="faculty" title="Faculty Profile">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-[24px] bg-[#07162d] p-7 text-white shadow-soft">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
              <UserRound size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                Faculty Profile
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage your faculty information and profile links.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading profile...
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">
                    Full Name
                  </label>

                  <input
                    className="input"
                    value={form.full_name}
                    onChange={(e) =>
                      updateField('full_name', e.target.value)
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="label">
                    Email
                  </label>

                  <input
                    className="input bg-slate-50"
                    value={form.email}
                    disabled
                  />
                </div>

                <div>
                  <label className="label">
                    Department
                  </label>

                  <input
                    className="input"
                    value={form.department}
                    onChange={(e) =>
                      updateField('department', e.target.value)
                    }
                    placeholder="ECE"
                  />
                </div>

                <div>
                  <label className="label">
                    Designation
                  </label>

                  <input
                    className="input"
                    value={form.designation}
                    onChange={(e) =>
                      updateField('designation', e.target.value)
                    }
                    placeholder="Assistant Professor"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Bio
                </label>

                <textarea
                  className="input min-h-32 resize-y"
                  value={form.bio}
                  onChange={(e) =>
                    updateField('bio', e.target.value)
                  }
                  placeholder="Write a short professional bio..."
                />
              </div>

              <div className="border-t pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <ExternalLink size={18} />
                  <h3 className="font-extrabold">
                    Professional Links
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label">
                      GitHub URL
                    </label>

                    <input
                      className="input"
                      value={form.github}
                      onChange={(e) =>
                        updateField('github', e.target.value)
                      }
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label className="label">
                      LinkedIn URL
                    </label>

                    <input
                      className="input"
                      value={form.linkedin}
                      onChange={(e) =>
                        updateField('linkedin', e.target.value)
                      }
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>

              {message && (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                  {message}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={loadProfile}
                  className="btn border bg-white text-slate-700"
                  disabled={saving}
                >
                  <RefreshCw size={16} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={saveProfile}
                  className="btn bg-[#07162d] text-white"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
