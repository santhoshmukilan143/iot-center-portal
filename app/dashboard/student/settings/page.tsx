'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Bell,
  Lock,
  Save,
  Settings as SettingsIcon,
  UserRound,
} from 'lucide-react';

export default function StudentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [portalNotifications, setPortalNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setEmail(user.email || '');

    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (data) {
      setFullName(data.full_name || '');
    }

    setLoading(false);
  }

  async function saveSettings() {
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      alert(error.message);
    } else {
      alert('Settings saved successfully!');
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <DashboardShell role="student" title="Settings">
        <div className="card p-10 text-center text-slate-500">
          Loading settings...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="student" title="Settings">
      <div className="mb-7">
        <h2 className="text-2xl font-black">Settings</h2>

        <p className="mt-1 text-sm text-slate-400">
          Manage your student portal preferences.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Account */}
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={20} />
            </div>

            <div>
              <h3 className="font-black">Account</h3>
              <p className="text-xs text-slate-400">
                Basic account information
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-bold">
                Full Name
              </label>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input mt-2 w-full"
                placeholder="Enter your name"
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
          </div>
        </section>

        {/* Notifications */}
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
              <Bell size={20} />
            </div>

            <div>
              <h3 className="font-black">Notifications</h3>
              <p className="text-xs text-slate-400">
                Choose which notifications you receive
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
              <div>
                <div className="text-sm font-bold">
                  Portal Notifications
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Tasks, announcements and updates
                </div>
              </div>

              <input
                type="checkbox"
                checked={portalNotifications}
                onChange={(e) =>
                  setPortalNotifications(e.target.checked)
                }
                className="h-5 w-5"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
              <div>
                <div className="text-sm font-bold">
                  Email Notifications
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Receive important updates by email
                </div>
              </div>

              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) =>
                  setEmailNotifications(e.target.checked)
                }
                className="h-5 w-5"
              />
            </label>
          </div>
        </section>

        {/* Security */}
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Lock size={20} />
            </div>

            <div>
              <h3 className="font-black">Security</h3>
              <p className="text-xs text-slate-400">
                Your password is securely managed by Supabase
                Authentication.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            To change your password, use the password recovery
            option on the login page.
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn bg-[#07162d] text-white disabled:opacity-50"
        >
          <Save size={17} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="mt-6 card flex items-center gap-3 p-5 text-sm text-slate-500">
        <SettingsIcon size={18} />
        Notification preferences will be connected to the portal
        notification system in the next phase.
      </div>
    </DashboardShell>
  );
}
