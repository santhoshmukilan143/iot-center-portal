'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Bell,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Info,
} from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
};

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, type, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <DashboardShell role="student" title="Notifications">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Notifications</h2>

          <p className="mt-1 text-sm text-slate-400">
            Important alerts and updates related to your portal activity.
          </p>
        </div>

        <button
          onClick={loadNotifications}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Bell size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No notifications
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            New notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card flex gap-4 p-5 ${
                !notification.is_read ? 'border-blue-200 bg-blue-50/30' : ''
              }`}
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  notification.is_read
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle2 size={20} />
                ) : notification.type === 'info' ? (
                  <Info size={20} />
                ) : (
                  <Bell size={20} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <h3 className="font-black">
                    {notification.title}
                  </h3>

                  {!notification.is_read && (
                    <span className="w-fit rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase text-blue-600">
                      New
                    </span>
                  )}
                </div>

                {notification.message && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={13} />
                    {formatTime(notification.created_at)}
                  </span>

                  <span>
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
