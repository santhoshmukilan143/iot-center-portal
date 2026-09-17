'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Notification = {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadNotifications() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadNotifications();
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
              Notifications
            </h1>

            <p className="mt-2 text-slate-500">
              View portal notifications and alerts.
            </p>
          </div>

          <button
            onClick={loadNotifications}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Notifications
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Unread
            </p>

            <p className="mt-2 text-3xl font-black text-orange-500">
              {notifications.filter((item) => !item.read).length}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load notifications
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Notifications */}
        <div className="space-y-4">

          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">🔔</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No notifications yet
              </h2>

              <p className="mt-2 text-slate-500">
                Notifications stored in Supabase will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                  !notification.read
                    ? 'border-blue-200 bg-blue-50/30'
                    : ''
                }`}
              >
                <div className="flex gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    🔔
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col justify-between gap-2 md:flex-row">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">
                          {notification.title}
                        </h2>

                        {!notification.read && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            Unread
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-400">
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    {notification.type && (
                      <span className="mt-4 inline-block rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold capitalize text-slate-600">
                        {notification.type}
                      </span>
                    )}

                  </div>

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
