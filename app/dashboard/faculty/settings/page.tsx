'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Setting = {
  id: string;
  key: string;
  value: string | null;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSettings() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      setError(error.message);
      setSettings([]);
    } else {
      setSettings(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Faculty Console
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Settings
            </h1>

            <p className="mt-2 text-slate-500">
              View portal configuration settings.
            </p>
          </div>

          <button
            onClick={loadSettings}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Settings
          </button>
        </div>

        {/* Settings Card */}
        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b p-6">
            <h2 className="text-xl font-black text-slate-900">
              Portal Configuration
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Settings stored in Supabase.
            </p>
          </div>

          {error && (
            <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-bold">
                Unable to load settings
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          )}

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading settings...
            </div>
          ) : settings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl">⚙️</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No settings found
              </h2>

              <p className="mt-2 text-slate-500">
                Portal settings added in Supabase will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex flex-col justify-between gap-3 p-6 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {setting.key}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Configuration value
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
                    {setting.value || 'Not configured'}
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
