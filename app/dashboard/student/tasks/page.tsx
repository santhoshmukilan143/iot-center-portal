'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  RefreshCw,
  CalendarDays,
  Paperclip,
  ArrowUpRight,
  Clock3,
} from 'lucide-react';

import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';

type Task = {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  instructions: string | null;
  assigned_to: string | null;
  group_id: string | null;
  start_date: string | null;
  deadline: string | null;
  priority: string | null;
  attachment_url: string | null;
  marks: number | null;
  submission_type: string | null;
  created_at: string;
};

type GroupMembership = {
  group_id: string;
};

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTasks() {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      /*
       * Get all groups where this student is a member.
       */
      const { data: memberships, error: membershipError } =
        await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

      if (membershipError) {
        throw membershipError;
      }

      const groupIds =
        (memberships as GroupMembership[] | null)?.map(
          (item) => item.group_id
        ) || [];

      /*
       * Get tasks.
       *
       * We fetch all tasks and filter them here because
       * the student can receive:
       *
       * 1. General task
       * 2. Personal task
       * 3. Group task
       */
      const { data, error: taskError } = await supabase
        .from('tasks')
        .select(
          `
          id,
          title,
          description,
          topic,
          instructions,
          assigned_to,
          group_id,
          start_date,
          deadline,
          priority,
          attachment_url,
          marks,
          submission_type,
          created_at
          `
        )
        .order('created_at', {
          ascending: false,
        });

      if (taskError) {
        throw taskError;
      }

      const allTasks = (data || []) as Task[];

      /*
       * Assignment rules:
       *
       * General:
       * assigned_to = null
       * group_id = null
       *
       * Specific student:
       * assigned_to = current user
       *
       * Specific group:
       * group_id belongs to student's groups
       */
      const visibleTasks = allTasks.filter((task) => {
        const isGeneral =
          task.assigned_to === null &&
          task.group_id === null;

        const isAssignedToStudent =
          task.assigned_to === user.id;

        const isAssignedToGroup =
          task.group_id !== null &&
          groupIds.includes(task.group_id);

        return (
          isGeneral ||
          isAssignedToStudent ||
          isAssignedToGroup
        );
      });

      setTasks(visibleTasks);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'Unable to load tasks.'
      );

      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function formatDate(date: string | null) {
    if (!date) return 'Not set';

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  }

  function assignmentLabel(task: Task) {
    if (
      task.assigned_to === null &&
      task.group_id === null
    ) {
      return 'General Task';
    }

    if (task.assigned_to) {
      return 'Assigned to you';
    }

    if (task.group_id) {
      return 'Group Task';
    }

    return 'Task';
  }

  function priorityClass(priority: string | null) {
    if (priority === 'urgent') {
      return 'bg-red-50 text-red-600';
    }

    if (priority === 'high') {
      return 'bg-orange-50 text-orange-600';
    }

    return 'bg-slate-100 text-slate-600';
  }

  return (
    <DashboardShell
      role="student"
      title="Tasks"
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-2xl font-black">
              My Tasks
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Tasks assigned to you, your group, or all students.
            </p>
          </div>

          <button
            onClick={loadTasks}
            disabled={loading}
            className="btn border bg-white text-slate-700"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="card p-12 text-center">

            <RefreshCw
              size={25}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-400">
              Loading your tasks...
            </p>

          </div>
        ) : tasks.length === 0 ? (
          /* Empty */
          <div className="card p-12 text-center">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <CheckSquare size={28} />
            </div>

            <h3 className="mt-5 text-lg font-black">
              No tasks available
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              You don't have any assigned tasks right now.
            </p>

          </div>
        ) : (
          /* Tasks */
          <div className="space-y-4">

            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/student/tasks/${task.id}`}
                className="group block"
              >
                <article className="card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">

                  <div className="p-5">

                    <div className="flex flex-col justify-between gap-5 md:flex-row">

                      {/* Left */}
                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                            <CheckSquare size={21} />
                          </div>

                          <h3 className="text-lg font-black">
                            {task.title}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${priorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority || 'normal'}
                          </span>

                        </div>

                        {/* Topic */}
                        {task.topic && (
                          <div className="mt-4 text-sm font-bold text-blue-600">
                            Topic · {task.topic}
                          </div>
                        )}

                        {/* Description */}
                        {task.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {task.description}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="mt-4 flex flex-wrap gap-2">

                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            {assignmentLabel(task)}
                          </span>

                          {task.attachment_url && (
                            <span className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                              <Paperclip size={13} />
                              Faculty Attachment
                            </span>
                          )}

                        </div>

                      </div>

                      {/* Right */}
                      <div className="flex shrink-0 flex-col gap-3 md:items-end">

                        <div className="rounded-xl bg-slate-50 px-4 py-3">

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CalendarDays size={14} />
                            Deadline
                          </div>

                          <div className="mt-1 text-sm font-black text-slate-700">
                            {formatDate(task.deadline)}
                          </div>

                        </div>

                        {task.marks !== null && (
                          <div className="text-xs font-semibold text-slate-400">
                            Marks · {task.marks}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                          Open Task
                          <ArrowUpRight
                            size={16}
                            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* Bottom */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-slate-50/70 px-5 py-3">

                    <div className="flex items-center gap-2 text-xs text-slate-400">

                      <Clock3 size={14} />

                      Created · {formatDate(task.created_at)}

                    </div>

                    <div className="text-xs font-semibold text-slate-500">
                      Click to view instructions & submit
                    </div>

                  </div>

                </article>
              </Link>
            ))}

          </div>
        )}

      </div>
    </DashboardShell>
  );
}
