'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Task = {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  instructions: string | null;
  priority: string | null;
  start_date: string | null;
  deadline: string | null;
  marks: number | null;
  submission_type: string | null;
  created_at: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTasks() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('tasks')
      .select(
        'id, title, description, topic, instructions, priority, start_date, deadline, marks, submission_type, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setTasks([]);
    } else {
      setTasks(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Faculty Console
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Tasks
            </h1>

            <p className="mt-2 text-slate-500">
              View and manage tasks assigned to students.
            </p>
          </div>

          <button
            onClick={loadTasks}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Tasks
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Tasks
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              High Priority
            </p>

            <p className="mt-2 text-3xl font-black text-red-600">
              {
                tasks.filter(
                  (task) => task.priority?.toLowerCase() === 'high'
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              With Deadline
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {tasks.filter((task) => task.deadline).length}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load tasks
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-5">

          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">📝</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No tasks yet
              </h2>

              <p className="mt-2 text-slate-500">
                Tasks added in Supabase will appear here.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >

                {/* Task Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row">

                  <div>
                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-2xl font-black text-slate-900">
                        {task.title}
                      </h2>

                      {task.priority && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            task.priority.toLowerCase() === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority.toLowerCase() === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}

                    </div>

                    {task.topic && (
                      <p className="mt-2 text-sm font-bold text-blue-600">
                        Topic: {task.topic}
                      </p>
                    )}
                  </div>

                  {task.deadline && (
                    <div className="h-fit rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-400">
                        DEADLINE
                      </p>

                      <p className="mt-1 font-black text-slate-800">
                        {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                </div>

                {/* Description */}
                {task.description && (
                  <p className="mt-5 leading-7 text-slate-600">
                    {task.description}
                  </p>
                )}

                {/* Instructions */}
                {task.instructions && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">
                      Instructions
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {task.instructions}
                    </p>
                  </div>
                )}

                {/* Details */}
                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">

                  {task.start_date && (
                    <span className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                      Start: {new Date(task.start_date).toLocaleDateString()}
                    </span>
                  )}

                  {task.marks !== null && (
                    <span className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">
                      Marks: {task.marks}
                    </span>
                  )}

                  {task.submission_type && (
                    <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                      Submission: {task.submission_type}
                    </span>
                  )}

                </div>

              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
