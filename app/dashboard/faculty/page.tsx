'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Counts = {
  students: number;
  groups: number;
  announcements: number;
  tasks: number;
  topics: number;
  projects: number;
  events: number;
  resources: number;
  gallery: number;
};

export default function FacultyDashboard() {
  const [counts, setCounts] = useState<Counts>({
    students: 0,
    groups: 0,
    announcements: 0,
    tasks: 0,
    topics: 0,
    projects: 0,
    events: 0,
    resources: 0,
    gallery: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    const [
      students,
      groups,
      announcements,
      tasks,
      topics,
      projects,
      events,
      resources,
      gallery,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student'),

      supabase
        .from('groups')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('announcements')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('topics')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('events')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('resources')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('gallery')
        .select('id', { count: 'exact', head: true }),
    ]);

    const firstError =
      students.error ||
      groups.error ||
      announcements.error ||
      tasks.error ||
      topics.error ||
      projects.error ||
      events.error ||
      resources.error ||
      gallery.error;

    if (firstError) {
      setError(firstError.message);
    }

    setCounts({
      students: students.count || 0,
      groups: groups.count || 0,
      announcements: announcements.count || 0,
      tasks: tasks.count || 0,
      topics: topics.count || 0,
      projects: projects.count || 0,
      events: events.count || 0,
      resources: resources.count || 0,
      gallery: gallery.count || 0,
    });

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    {
      title: 'Students',
      value: counts.students,
      icon: '👨‍🎓',
      link: '/dashboard/faculty/students',
    },
    {
      title: 'Groups',
      value: counts.groups,
      icon: '👥',
      link: '/dashboard/faculty/groups',
    },
    {
      title: 'Announcements',
      value: counts.announcements,
      icon: '📢',
      link: '/dashboard/faculty/announcements',
    },
    {
      title: 'Tasks',
      value: counts.tasks,
      icon: '📝',
      link: '/dashboard/faculty/tasks',
    },
    {
      title: 'Topics',
      value: counts.topics,
      icon: '📚',
      link: '/dashboard/faculty/topics',
    },
    {
      title: 'Projects',
      value: counts.projects,
      icon: '🚀',
      link: '/dashboard/faculty/projects',
    },
    {
      title: 'Events',
      value: counts.events,
      icon: '📅',
      link: '/dashboard/faculty/events',
    },
    {
      title: 'Resources',
      value: counts.resources,
      icon: '📖',
      link: '/dashboard/faculty/resources',
    },
    {
      title: 'Gallery',
      value: counts.gallery,
      icon: '🖼️',
      link: '/dashboard/faculty/gallery',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              IoT Innovation Center
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Faculty Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage students, research activities and portal content.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Dashboard
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Some dashboard data could not be loaded
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {cards.map((card) => (
            <a
              key={card.title}
              href={card.link}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {card.icon}
                </div>

                <span className="text-slate-300 transition group-hover:text-blue-500">
                  →
                </span>

              </div>

              <p className="mt-5 text-sm font-bold text-slate-500">
                {card.title}
              </p>

              <p className="mt-1 text-4xl font-black text-slate-900">
                {loading ? '...' : card.value}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                View details →
              </p>
            </a>
          ))}

        </div>

        {/* Quick Info */}
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-black text-slate-900">
            Portal Overview
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            All statistics shown above are loaded directly from your
            Supabase database. No dummy data is used.
          </p>

        </div>

      </div>
    </main>
  );
}
