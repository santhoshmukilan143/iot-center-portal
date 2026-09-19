'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Network,
  FolderKanban,
  Clock3,
  CalendarDays,
  ClipboardList,
  Bell,
  Plus,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

import DashboardShell from '@/components/DashboardShell';
import StatusPill from '@/components/StatusPill';
import { supabase } from '@/lib/supabase';

type Task = {
  id: string;
  title: string;
  deadline: string | null;
};

export default function FacultyDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    students: 0,
    groups: 0,
    projects: 0,
    tasks: 0,
    events: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([]);

  async function loadDashboard() {
    setLoading(true);

    const [
      studentsResult,
      groupsResult,
      projectsResult,
      tasksResult,
      eventsResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student'),

      supabase
        .from('groups')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('tasks')
        .select('id,title,deadline')
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('events')
        .select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      students: studentsResult.count || 0,
      groups: groupsResult.count || 0,
      projects: projectsResult.count || 0,
      tasks: tasksResult.count || 0,
      events: eventsResult.count || 0,
    });

    setTasks(tasksResult.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardShell role="faculty" title="Faculty Dashboard">
      <div className="space-y-7">

        <div className="rounded-[24px] bg-[#07162d] p-7 text-white shadow-soft">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="text-sm font-semibold text-cyan-300">
                Good morning 👋
              </div>

              <h2 className="mt-1 text-3xl font-black">
                Welcome back, Faculty
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Manage students, tasks, projects and research activities.
              </p>
            </div>

            <Link
              href="/dashboard/faculty/tasks"
              className="btn bg-white text-[#07162d]"
            >
              Manage Tasks
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <Stat
            icon={Users}
            value={stats.students}
            label="Students"
          />

          <Stat
            icon={Network}
            value={stats.groups}
            label="Active Groups"
          />

          <Stat
            icon={FolderKanban}
            value={stats.projects}
            label="Projects"
          />

          <Stat
            icon={Clock3}
            value={stats.tasks}
            label="Tasks"
          />

          <Stat
            icon={CalendarDays}
            value={stats.events}
            label="Events"
          />

        </div>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">

          <section className="card overflow-hidden">

            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="font-extrabold">
                  Recent Tasks
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Latest tasks from Supabase
                </p>
              </div>

              <button
                onClick={loadDashboard}
                className="grid h-9 w-9 place-items-center rounded-xl border"
              >
                <RefreshCw
                  size={16}
                  className={loading ? 'animate-spin' : ''}
                />
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No tasks created yet.
              </div>
            ) : (
              <div className="divide-y">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <div className="font-bold">
                        {task.title}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Deadline ·{' '}
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString(
                              'en-IN',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : 'Not set'}
                      </div>
                    </div>

                    <StatusPill status="pending" />
                  </div>
                ))}
              </div>
            )}

          </section>

          <section className="card p-5">

            <h3 className="font-extrabold">
              Quick Actions
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Frequently used faculty actions
            </p>

            <div className="mt-5 space-y-3">

              <QuickAction
                href="/dashboard/faculty/tasks"
                icon={ClipboardList}
                title="Create Task"
                text="Assign work to students"
              />

              <QuickAction
                href="/dashboard/faculty/announcements"
                icon={Bell}
                title="Announcement"
                text="Post an announcement"
              />

              <QuickAction
                href="/dashboard/faculty/events"
                icon={CalendarDays}
                title="Create Event"
                text="Add a research or college event"
              />

              <QuickAction
                href="/dashboard/faculty/projects"
                icon={FolderKanban}
                title="Add Project"
                text="Create a research project"
              />

              <QuickAction
                href="/dashboard/faculty/groups"
                icon={Users}
                title="Create Group"
                text="Create a student research group"
              />

            </div>
          </section>

        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  return (
    <div className="card p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={21} />
      </div>

      <div className="mt-5 text-3xl font-black">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">
        {label}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-slate-50"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>

      <div>
        <div className="text-sm font-bold">
          {title}
        </div>

        <div className="text-xs text-slate-400">
          {text}
        </div>
      </div>
    </Link>
  );
}
