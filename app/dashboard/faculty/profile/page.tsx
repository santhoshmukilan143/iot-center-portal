'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  department: string | null;
  designation: string | null;
  bio: string | null;
  avatar_url: string | null;
  github: string | null;
  linkedin: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProfile() {
    setLoading(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You are not logged in.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, full_name, email, department, designation, bio, avatar_url, github, linkedin'
      )
      .eq('id', user.id)
      .single();

    if (error) {
      setError(error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Faculty Console
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            Profile
          </h1>

          <p className="mt-2 text-slate-500">
            View your faculty profile information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load profile
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
            Loading profile...
          </div>
        ) : profile ? (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8">
              <div className="flex flex-col items-center gap-5 md:flex-row">

                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-4xl font-black text-blue-600 shadow-lg">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-white">
                    {profile.full_name}
                  </h2>

                  <p className="mt-1 text-blue-50">
                    {profile.designation || 'Faculty'}
                  </p>
                </div>

              </div>
            </div>

            {/* Details */}
            <div className="grid gap-6 p-8 md:grid-cols-2">

              <div>
                <p className="text-sm font-bold text-slate-400">
                  Full Name
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  {profile.full_name}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-400">
                  Email
                </p>

                <p className="mt-2 break-all font-bold text-slate-800">
                  {profile.email || 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-400">
                  Department
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  {profile.department || 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-400">
                  Designation
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  {profile.designation || 'Not available'}
                </p>
              </div>

            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="border-t px-8 py-6">
                <p className="text-sm font-bold text-slate-400">
                  About
                </p>

                <p className="mt-2 leading-7 text-slate-600">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Links */}
            {(profile.github || profile.linkedin) && (
              <div className="flex flex-wrap gap-3 border-t px-8 py-6">

                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    GitHub →
                  </a>
                )}

                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    LinkedIn →
                  </a>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <div className="text-5xl">👤</div>

            <h2 className="mt-4 text-xl font-black text-slate-900">
              Profile not found
            </h2>

            <p className="mt-2 text-slate-500">
              Your profile could not be found in Supabase.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
