'use client';

import { useEffect, useState } from 'react';

import DashboardShell from '@/components/DashboardShell';
import StatCard from '@/components/StatCard';

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Users,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

import Link from 'next/link';

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from 'recharts';

import { supabase } from '@/lib/supabase';

type Activity = {
  name: string;
  tasks: number;
};

type PendingReview = {
  id: string;
  taskTitle: string;
  studentName: string;
};

export default function FacultyDashboard() {
  const [students, setStudents] = useState(0);
  const [projects, setProjects] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [groups, setGroups] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);

  const [activity, setActivity] = useState<Activity[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        studentsResult,
        projectsResult,
        pendingResult,
        completedResult,
        groupsResult,
        eventsResult,
        activityResult,
        reviewsResult,
      ] = await Promise.all([
        // Students
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'student'),

        // Active projects
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .neq('stage', 'completed'),

        // Pending submissions
        supabase
          .from('task_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'submitted'),

        // Reviewed/completed submissions
        supabase
          .from('task_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'reviewed'),

        // Groups
        supabase
          .from('groups')
          .select('id', { count: 'exact', head: true }),

        // Upcoming events
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .gte('event_date', today),

        // Recent student activity
        supabase
          .from('task_submissions')
          .select('submitted_at')
          .gte(
            'submitted_at',
            new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order('submitted_at', { ascending: true }),

        // Pending reviews
        supabase
          .from('task_submissions')
          .select(`
            id,
            tasks(title),
            profiles(full_name)
          `)
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false })
          .limit(4),
      ]);

      if (
        studentsResult.error ||
        projectsResult.error ||
        pendingResult.error ||
        completedResult.error ||
        groupsResult.error ||
        eventsResult.error ||
        activityResult.error ||
        reviewsResult.error
      ) {
        const firstError =
          studentsResult.error ||
          projectsResult.error ||
          pendingResult.error ||
          completedResult.error ||
          groupsResult.error ||
          eventsResult.error ||
          activityResult.error ||
          reviewsResult.error;

        throw new Error(firstError?.message || 'Unable to load dashboard');
      }

      setStudents(studentsResult.count || 0);
      setProjects(projectsResult.count || 0);
      setPendingSubmissions(pendingResult.count || 0);
      setCompletedTasks(completedResult.count || 0);
      setGroups(groupsResult.count || 0);
      setUpcomingEvents(eventsResult.count || 0);

      // Create last 6 days activity
      const days: Activity[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();

        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);

        const dateKey = date.toISOString().split('T')[0];

        const count =
          activityResult.data?.filter((item) => {
            return item.submitted_at.startsWith(dateKey);
          }).length || 0;

        days.push({
          name: date.toLocaleDateString('en-US', {
            weekday: 'short',
          }),
          tasks: count,
        });
      }

      setActivity(days);

      // Pending review data
      const reviews: PendingReview[] =
        (reviewsResult.data || []).map((item: any) => ({
          id: item.id,
          taskTitle: item.tasks?.title || 'Untitled Task',
          studentName: item.profiles?.full_name || 'Unknown Student',
        }));

      setPendingReviews(reviews);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard data'
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardShell
      role="faculty"
      title="Faculty Dashboard"
    >
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-bold text-blue-600">
            Faculty Console
          </div>

          <h2 className="mt-1 text-3xl font-black">
            Good morning, Faculty
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage learning, research and project activity from one place.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            className="btn btn-primary"
            href="/dashboard/faculty/tasks"
          >
            <Plus size={16} />
            Create Task
          </Link>

          <Link
            className="btn btn-ghost"
            href="/dashboard/faculty/announcements"
          >
            <Plus size={16} />
            Announcement
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-bold">
            Dashboard data could not be loaded
          </div>

          <div className="mt-1">
            {error}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">

        <StatCard
          label="Total Students"
          value={loading ? '...' : students}
          icon={Users}
        />

        <StatCard
          label="Active Projects"
          value={loading ? '...' : projects}
          icon={FolderKanban}
        />

        <StatCard
          label="Pending Submissions"
          value={loading ? '...' : pendingSubmissions}
          icon={BookOpen}
        />

        <StatCard
          label="Completed Tasks"
          value={loading ? '...' : completedTasks}
          icon={CheckCircle2}
        />

        <StatCard
          label="Active Groups"
          value={loading ? '...' : groups}
          icon={Users}
        />

        <StatCard
          label="Upcoming Events"
          value={loading ? '...' : upcomingEvents}
          icon={CalendarDays}
        />

      </div>

      {/* Chart + Reviews */}
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">

        {/* Student Activity */}
        <section className="card p-5">

          <div className="flex justify-between">

            <div>
              <h3 className="font-extrabold">
                Student Activity
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Task submissions over the last 6 days
              </p>
            </div>

            <TrendingUp
              className="text-blue-600"
              size={20}
            />

          </div>

          <div className="mt-6 h-72">

            {activity.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={activity}>

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: 'rgba(22,119,255,.05)',
                    }}
                  />

                  <Bar
                    dataKey="tasks"
                    radius={[8, 8, 0, 0]}
                    fill="#1677ff"
                  />

                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No activity data available.
              </div>
            )}

          </div>
        </section>

        {/* Pending Reviews */}
        <section className="card">

          <div className="border-b p-5">

            <h3 className="font-extrabold">
              Pending Reviews
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Submissions needing attention
            </p>

          </div>

          <div className="divide-y">

            {loading ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Loading reviews...
              </div>
            ) : pendingReviews.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                No pending reviews.
              </div>
            ) : (
              pendingReviews.map((review) => (
                <div
                  className="flex items-center justify-between p-4"
                  key={review.id}
                >

                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">
                      {review.taskTitle}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {review.studentName}
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="shrink-0 text-slate-400"
                  />

                </div>
              ))
            )}

          </div>
        </section>

      </div>
    </DashboardShell>
  );
}
