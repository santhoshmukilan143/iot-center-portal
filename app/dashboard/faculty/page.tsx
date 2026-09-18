'use client';

import DashboardShell from '@/components/DashboardShell';
import StatCard from '@/components/StatCard';
import StatusPill from '@/components/StatusPill';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Users,
  ArrowUpRight,
  MessageCircle,
  Wifi,
  Plus,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

export default function FacultyDashboard() {
  return (
    <DashboardShell role="faculty" title="Faculty Dashboard">
      {/* Welcome Banner */}
      <div className="mb-7 rounded-[24px] bg-[#07162d] p-7 text-white shadow-soft">
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Students"
          value={42}
          icon={Users}
        />

        <StatCard
          label="Active Groups"
          value={8}
          icon={Users}
        />

        <StatCard
          label="Active Projects"
          value={12}
          icon={FolderKanban}
        />

        <StatCard
          label="Pending Tasks"
          value={15}
          icon={Clock3}
        />

        <StatCard
          label="Upcoming Events"
          value={4}
          icon={CalendarDays}
        />
      </div>

      {/* Main Content */}
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        {/* Recent Tasks */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h3 className="font-extrabold">
                Recent Tasks
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Latest tasks assigned to students
              </p>
            </div>

            <Link
              href="/dashboard/faculty/tasks"
              className="text-sm font-bold text-blue-600"
            >
              View all
            </Link>
          </div>

          <div className="divide-y">
            {[
              [
                'Build an ESP32 Temperature Monitoring System',
                '25 Sep 2026',
                'in_progress',
              ],
              [
                'Literature Review — Smart Agriculture',
                '28 Sep 2026',
                'pending',
              ],
              [
                'Prepare Project Demo Documentation',
                '30 Sep 2026',
                'submitted',
              ],
            ].map(([title, deadline, status]) => (
              <div
                key={title}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-bold">
                    {title}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Deadline · {deadline}
                  </div>
                </div>

                <StatusPill status={status as any} />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="card p-5">
          <h3 className="font-extrabold">
            Quick Actions
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Frequently used faculty actions
          </p>

          <div className="mt-5 space-y-3">
            <Link
              href="/dashboard/faculty/tasks"
              className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-slate-50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList size={17} />
              </div>

              <div>
                <div className="text-sm font-bold">
                  Create Task
                </div>

                <div className="text-xs text-slate-400">
                  Assign work to students
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/faculty/announcements"
              className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-slate-50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={17} />
              </div>

              <div>
                <div className="text-sm font-bold">
                  Announcement
                </div>

                <div className="text-xs text-slate-400">
                  Post an announcement
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/faculty/events"
              className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-slate-50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarDays size={17} />
              </div>

              <div>
                <div className="text-sm font-bold">
                  Create Event
                </div>

                <div className="text-xs text-slate-400">
                  Add a research or college event
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/faculty/daily-updates"
              className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-slate-50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Wifi size={17} />
              </div>

              <div>
                <div className="text-sm font-bold">
                  Daily Update
                </div>

                <div className="text-xs text-slate-400">
                  Share today's update
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* Bottom Section */}
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <section className="card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <div className="text-xs text-slate-400">
                Completed
              </div>

              <div className="text-2xl font-black">
                28
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Tasks completed by students
          </p>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <FolderKanban size={19} />
            </div>

            <div>
              <div className="text-xs text-slate-400">
                Projects
              </div>

              <div className="text-2xl font-black">
                12
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Research projects currently active
          </p>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <MessageCircle size={19} />
            </div>

            <div>
              <div className="text-xs text-slate-400">
                Feedback
              </div>

              <div className="text-2xl font-black">
                7
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Student submissions awaiting review
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
