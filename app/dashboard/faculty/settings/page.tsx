'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Settings,
  Save,
  RefreshCw,
  Bell,
  Globe,
  ShieldCheck,
} from 'lucide-react';

type SettingsData = {
  portal_name: string;
  portal_description: string;
  contact_email: string;
  notifications_enabled: boolean;
};

const defaultSettings: SettingsData = {
  portal_name: 'IoT Innovation & Research Center',
  portal_description:
    'IoT Innovation & Research Center Portal',
  contact_email: '',
  notifications_enabled: true,
};

export default function FacultySettingsPage() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      const values: Record<string, string> = {};

      (data || []).forEach((item: any) => {
        if (
          item.key !== undefined &&
          item.value !== undefined
        ) {
          values[item.key] = item.value;
        }
      });

      setSettings({
        portal_name:
          values.portal_name ||
          defaultSettings.portal_name,

        portal_description:
          values.portal_description ||
          defaultSettings.portal_description,

        contact_email:
          values.contact_email || '',

        notifications_enabled:
          values.notifications_enabled !== 'false',
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSetting(
    key: string,
    value: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not logged in.');
    }

    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('settings')
        .update({
          value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('settings')
        .insert({
          key,
          value,
          updated_by: user.id,
        });

      if (error) throw error;
    }
  }

  async function saveSettings() {
    setSaving(true);

    try {
      await saveSetting(
        'portal_name',
        settings.portal_name.trim()
      );

      await saveSetting(
        'portal_description',
        settings.portal_description.trim()
      );

      await saveSetting(
        'contact_email',
        settings.contact_email.trim()
      );

      await saveSetting(
        'notifications_enabled',
        String(settings.notifications_enabled)
      );

      alert('Settings saved successfully.');
      await loadSettings();
    } catch (error: any) {
      alert(
        error.message ||
          'Unable to save settings.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell
        role="faculty"
        title="Settings"
      >
        <div className="card p-10 text-center text-sm text-slate-400">
          Loading settings...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="faculty"
      title="Settings"
    >
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Portal Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage general settings for the research center portal.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        {/* Main Settings */}
        <section className="card overflow-hidden">
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Settings size={19} />
              </div>

              <div>
                <h3 className="font-extrabold">
                  General Settings
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Update the portal information.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6">
            {/* Portal Name */}
            <div>
              <label className="label">
                Portal Name
              </label>

              <input
                className="input"
                value={settings.portal_name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    portal_name: e.target.value,
                  })
                }
                placeholder="Portal name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">
                Portal Description
              </label>

              <textarea
                className="input min-h-28"
                value={
                  settings.portal_description
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    portal_description:
                      e.target.value,
                  })
                }
                placeholder="Portal description"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="label">
                Contact Email
              </label>

              <input
                type="email"
                className="input"
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact_email:
                      e.target.value,
                  })
                }
                placeholder="center@example.com"
              />
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Bell size={18} />
                  </div>

                  <div>
                    <div className="font-bold">
                      Notifications
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      Enable portal notifications.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications_enabled:
                        !settings.notifications_enabled,
                    })
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    settings.notifications_enabled
                      ? 'bg-blue-600'
                      : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      settings.notifications_enabled
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t p-6">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn bg-[#07162d] text-white"
            >
              <Save size={16} />

              {saving
                ? 'Saving...'
                : 'Save Settings'}
            </button>
          </div>
        </section>

        {/* Information Cards */}
        <div className="space-y-5">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-600">
                <ShieldCheck size={19} />
              </div>

              <div>
                <h3 className="font-extrabold">
                  Security
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Your portal is protected by Supabase authentication.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-500">
                Access Control
              </div>

              <p className="mt-1 text-sm text-slate-600">
                Faculty and admin accounts can manage portal content.
              </p>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
                <Globe size={19} />
              </div>

              <div>
                <h3 className="font-extrabold">
                  Portal
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Current portal configuration.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Platform
                </div>

                <div className="mt-1 text-sm font-semibold">
                  IoT Innovation & Research Center
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Authentication
                </div>

                <div className="mt-1 text-sm font-semibold">
                  Supabase Auth
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Database
                </div>

                <div className="mt-1 text-sm font-semibold">
                  Supabase PostgreSQL
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
