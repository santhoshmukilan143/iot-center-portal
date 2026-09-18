//
'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';

import {
  UserRound,
  Save,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  department: string | null;
  designation: string | null;
  bio: string | null;
  skills: string[] | null;
  interests: string[] | null;
  github: string | null;
  linkedin: string | null;
};

const emptyForm = {
  full_name: '',
  email: '',
  avatar_url: '',
  department: '',
  designation: '',
  bio: '',
  skills: '',
  interests: '',
  github: '',
  linkedin: '',
};

export default function FacultyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadProfile() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not logged in.');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);

      setForm({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        avatar_url: data.avatar_url || '',
        department: data.department || '',
        designation: data.designation || '',
        bio: data.bio || '',
        skills: Array.isArray(data.skills)
          ? data.skills.join(', ')
          : '',
        interests: Array.isArray(data.interests)
          ? data.interests.join(', ')
          : '',
        github: data.github || '',
        linkedin: data.linkedin || '',
      });
    } catch (error: any) {
      alert(
        error.message || 'Unable to load profile.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile() {
    if (!form.full_name.trim()) {
      alert('Please enter your full name.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not logged in.');
      }

      const skills = form.skills
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const interests = form.interests
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name.trim(),
          avatar_url: form.avatar_url.trim() || null,
          department: form.department.trim() || null,
          designation: form.designation.trim() || null,
          bio: form.bio.trim() || null,
          skills,
          interests,
          github: form.github.trim() || null,
          linkedin: form.linkedin.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully.');
      await loadProfile();
    } catch (error: any) {
      alert(
        error.message || 'Unable to update profile.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell
        role="faculty"
        title="Faculty Profile"
      >
        <div className="card p-10 text-center text-sm text-slate-400">
          Loading profile...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="faculty"
      title="Faculty Profile"
    >
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Faculty Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your faculty profile information.
          </p>
        </div>

        <button
          onClick={loadProfile}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]">

        {/* Profile Card */}
        <section className="card p-6">
          <div className="flex flex-col items-center text-center">

            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-[#07162d] text-4xl font-black text-white">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt={form.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                form.full_name
                  .slice(0, 1)
                  .toUpperCase() || 'F'
              )}
            </div>

            <h3 className="mt-5 text-xl font-black">
              {form.full_name || 'Faculty'}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {form.designation || 'Faculty Member'}
            </p>

            <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Faculty
            </span>
          </div>

          <div className="mt-7 space-y-4 border-t pt-6">

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Email
              </div>

              <div className="mt-1 break-all text-sm font-semibold">
                {form.email || '-'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Department
              </div>

              <div className="mt-1 text-sm font-semibold">
                {form.department || '-'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Designation
              </div>

              <div className="mt-1 text-sm font-semibold">
                {form.designation || '-'}
              </div>
            </div>

          </div>
        </section>

        {/* Edit Form */}
        <section className="card overflow-hidden">

          <div className="border-b p-6">
            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <UserRound size={19} />
              </div>

              <div>
                <h3 className="font-extrabold">
                  Profile Information
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Update your details below.
                </p>
              </div>

            </div>
          </div>

          <div className="grid gap-5 p-6">

            {/* Name */}
            <div>
              <label className="label">
                Full Name *
              </label>

              <input
                className="input"
                value={form.full_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name: e.target.value,
                  })
                }
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">
                Email
              </label>

              <input
                className="input bg-slate-50"
                value={form.email}
                disabled
              />

              <p className="mt-1 text-[11px] text-slate-400">
                Email is managed by Supabase authentication.
              </p>
            </div>

            {/* Department + Designation */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="label">
                  Department
                </label>

                <input
                  className="input"
                  value={form.department}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      department: e.target.value,
                    })
                  }
                  placeholder="Example: ECE"
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
                    setForm({
                      ...form,
                      designation: e.target.value,
                    })
                  }
                  placeholder="Example: Assistant Professor"
                />
              </div>

            </div>

            {/* Avatar */}
            <div>
              <label className="label">
                Profile Image URL
              </label>

              <input
                className="input"
                value={form.avatar_url}
                onChange={(e) =>
                  setForm({
                    ...form,
                    avatar_url: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>

            {/* Bio */}
            <div>
              <label className="label">
                Bio
              </label>

              <textarea
                className="input min-h-28"
                value={form.bio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bio: e.target.value,
                  })
                }
                placeholder="Write a short bio..."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="label">
                Skills
              </label>

              <input
                className="input"
                value={form.skills}
                onChange={(e) =>
                  setForm({
                    ...form,
                    skills: e.target.value,
                  })
                }
                placeholder="IoT, Embedded Systems, VLSI"
              />

              <p className="mt-1 text-[11px] text-slate-400">
                Separate multiple skills with commas.
              </p>
            </div>

            {/* Interests */}
            <div>
              <label className="label">
                Research Interests
              </label>

              <input
                className="input"
                value={form.interests}
                onChange={(e) =>
                  setForm({
                    ...form,
                    interests: e.target.value,
                  })
                }
                placeholder="AI, Robotics, IoT"
              />

              <p className="mt-1 text-[11px] text-slate-400">
                Separate multiple interests with commas.
              </p>
            </div>

            {/* Social Links */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="label">
                  GitHub
                </label>

                <div className="relative">

                  <ExternalLink
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className="input pl-10"
                    value={form.github}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        github: e.target.value,
                      })
                    }
                    placeholder="https://github.com/..."
                  />

                </div>
              </div>

              <div>
                <label className="label">
                  LinkedIn
                </label>

                <div className="relative">

                  <ExternalLink
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className="input pl-10"
                    value={form.linkedin}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        linkedin: e.target.value,
                      })
                    }
                    placeholder="https://linkedin.com/in/..."
                  />

                </div>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end border-t p-6">

            <button
              onClick={saveProfile}
              disabled={saving}
              className="btn bg-[#07162d] text-white"
            >
              <Save size={16} />

              {saving
                ? 'Saving...'
                : 'Save Profile'}
            </button>

          </div>

        </section>

      </div>
    </DashboardShell>
  );
}
