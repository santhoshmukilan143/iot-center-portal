'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import StatusPill from '@/components/StatusPill';
import { supabase } from '@/lib/supabase';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Target,
} from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  instructions: string | null;
  start_date: string | null;
  deadline: string | null;
  priority: string | null;
  marks: number | null;
};

type Submission = {
  task_id: string;
  status: string;
  marks: number | null;
};

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select(
        'id, title, description, topic, instructions, start_date, deadline, priority, marks'
      )
      .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
      .order('deadline', { ascending: true });

    if (taskError) {
      console.error(taskError);
      setTasks([]);
    } else {
      setTasks(taskData || []);
    }

    const { data: submissionData, error: submissionError } =
      await supabase
        .from('task_submissions')
        .select('task_id, status, marks')
        .eq('student_id', user.id);

    if (!submissionError) {
      setSubmissions(submissionData || []);
    }

    setLoading(false);
  }

  function getSubmission(taskId: string) {
    return submissions.find((item) => item.task_id === taskId);
  }

  function formatDate(date: string | null) {
    if (!date) return 'No deadline';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getTaskStatus(task: Task) {
    const submission = getSubmission(task.id);

    if (submission) {
      return submission.status;
    }

    if (task.deadline) {
      const deadline = new Date(`${task.deadline}T23:59:59`);
      if (deadline < new Date()) {
        return 'overdue';
      }
    }

    return 'pending';
  }

  return (
    <DashboardShell role="student" title="Tasks">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">My Tasks</h2>

          <p className="mt-1 text-sm text-slate-400">
            Tasks assigned to you by the faculty.
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">Pending</p>
              <p className="text-xl font-black">
                {tasks.filter((t) => getTaskStatus(t) === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Target size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">In Progress</p>
              <p className="text-xl font-black">
                {
                  tasks.filter(
                    (t) => getTaskStatus(t) === 'in_progress'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">Submitted</p>
              <p className="text-xl font-black">
                {
                  tasks.filter(
                    (t) => getTaskStatus(t) === 'submitted'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-xs text-slate-400">Overdue</p>
              <p className="text-xl font-black">
                {
                  tasks.filter(
                    (t) => getTaskStatus(t) === 'overdue'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <FileText size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No tasks assigned
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Tasks assigned by faculty will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const status = getTaskStatus(task);
            const submission = getSubmission(task.id);

            return (
              <div
                key={task.id}
                className="card p-5 transition hover:shadow-lg"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black">
                        {task.title}
                      </h3>

                      <StatusPill status={status as any} />
                    </div>

                    {task.topic && (
                      <div className="mt-2 text-xs font-bold text-blue-600">
                        Topic · {task.topic}
                      </div>
                    )}

                    {task.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {task.description}
                      </p>
                    )}

                    {task.instructions && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Instructions
                        </div>

                        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                          {task.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 rounded-2xl border bg-white p-4 lg:min-w-52">
                    <div className="text-xs text-slate-400">
                      Deadline
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm font-black">
                      <CalendarDays size={16} />
                      {formatDate(task.deadline)}
                    </div>

                    {task.priority && (
                      <div className="mt-3">
                        <span className="text-xs text-slate-400">
                          Priority
                        </span>

                        <div className="mt-1 text-sm font-bold capitalize">
                          {task.priority}
                        </div>
                      </div>
                    )}

                    {task.marks !== null && (
                      <div className="mt-3">
                        <span className="text-xs text-slate-400">
                          Maximum Marks
                        </span>

                        <div className="mt-1 text-sm font-bold">
                          {task.marks}
                        </div>
                      </div>
                    )}

                    {submission?.marks !== null &&
                      submission?.marks !== undefined && (
                        <div className="mt-3">
                          <span className="text-xs text-slate-400">
                            Your Marks
                          </span>

                          <div className="mt-1 text-sm font-black text-green-600">
                            {submission.marks}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
