'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import { UserRound, Mail, Building2, GraduationCap, Save } from 'lucide-react';

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setEmail(user.email || '');

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, department, year, section, bio')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setFullName(data.full_name || '');
      setDepartment(data.department || '');
      setYear(data.year || '');
      setSection(data.section || '');
      setBio(data.bio || '');
    }

    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        department,
        year,
        section,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      alert(error.message);
    } else {
      alert('Profile updated successfully!');
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <DashboardShell role="student" title="My Profile">
        <div className="card p-8 text-center text-slate-500">
          Loading profile...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="student" title="My Profile">
      <div className="mb-6">
        <h2 className="text-2xl font-black">My Profile</h2>
        <p className="mt-1 text-sm text-slate-400">
          View and update your student information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Profile Card */}
        <div className="card p-6">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#07162d] text-white">
            <UserRound size={42} />
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-lg font-black">
              {fullName || 'Student'}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Student
            </p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={17} />
              <span className="break-all">{email}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <Building2 size={17} />
              <span>{department || 'Department not set'}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <GraduationCap size={17} />
              <span>
                {year || 'Year not set'}
                {section ? ` · ${section}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card p-6">
          <h3 className="text-lg font-black">
            Personal Information
          </h3>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold">
                Full Name
              </label>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input mt-2 w-full"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="text-sm font-bold">
                Email
              </label>

              <input
                value={email}
                disabled
                className="input mt-2 w-full bg-slate-50"
              />
            </div>

            <div>
              <label className="text-sm font-bold">
                Department
              </label>

              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input mt-2 w-full"
                placeholder="ECE"
              />
            </div>

            <div>
              <label className="text-sm font-bold">
                Year
              </label>

              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input mt-2 w-full"
                placeholder="3rd Year"
              />
            </div>

            <div>
              <label className="text-sm font-bold">
                Section
              </label>

              <input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="input mt-2 w-full"
                placeholder="A"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-bold">
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="input mt-2 w-full resize-none"
                placeholder="Tell something about yourself..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="btn bg-[#07162d] text-white disabled:opacity-50"
            >
              <Save size={17} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
