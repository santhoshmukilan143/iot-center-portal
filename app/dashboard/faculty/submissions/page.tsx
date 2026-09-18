'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  ClipboardList,
  RefreshCw,
  Eye,
  X,
  Save,
  ExternalLink,
} from 'lucide-react';

type Submission = {
  id: string;
  task_id: string | null;
  student_id: string | null;
  text_content: string | null;
  file_urls: string[] | null;
  link_url: string | null;
  status:
    | 'pending'
    | 'in_progress'
    | 'submitted'
    | 'reviewed'
    | 'overdue';
  feedback: string | null;
  marks: number | null;
  submitted_at: string;
  reviewed_at: string | null;
  student_name?: string;
  student_email?: string;
  task_title?: string;
};

type Task = {
  id: string;
  title: string;
};

export default function FacultySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] =
    useState<Submission | null>(null);

  const [feedback, setFeedback] = useState('');
  const [marks, setMarks] = useState('');
  const [status, setStatus] =
    useState<Submission['status']>('reviewed');

  async function loadSubmissions() {
    setLoading(true);

    const { data, error } = await supabase
      .from('task_submissions')
      .select(
        `
        id,
        task_id,
        student_id,
        text_content,
        file_urls,
        link_url,
        status,
        feedback,
        marks,
        submitted_at,
        reviewed_at,
        tasks (
          title
        ),
        profiles (
          full_name,
          email
        )
      `
      )
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error(error);
      setSubmissions([]);
    } else {
      const formatted = (data || []).map(
        (item: any) => ({
          ...item,
          task_title:
            item.tasks?.title || 'Unknown Task',
          student_name:
            item.profiles?.full_name || 'Unknown Student',
          student_email:
            item.profiles?.email || '',
        })
      );

      setSubmissions(formatted);
    }

    setLoading(false);
  }

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title')
      .order('created_at', { ascending: false });

    if (!error) {
      setTasks(data || []);
    }
  }

  useEffect(() => {
    loadSubmissions();
    loadTasks();
  }, []);

  function openReview(submission: Submission) {
    setSelected(submission);
    setFeedback(submission.feedback || '');
    setMarks(
      submission.marks !== null
        ? String(submission.marks)
        : ''
    );
    setStatus(submission.status);
  }

  function closeReview() {
    if (saving) return;

    setSelected(null);
    setFeedback('');
    setMarks('');
    setStatus('reviewed');
  }

  async function saveReview() {
    if (!selected) return;

    setSaving(true);

    try {
      const numericMarks =
        marks.trim() === ''
          ? null
          : Number(marks);

      if (
        numericMarks !== null &&
        (Number.isNaN(numericMarks) ||
          numericMarks < 0)
      ) {
        throw new Error(
          'Please enter a valid marks value.'
        );
      }

      const { error } = await supabase
        .from('task_submissions')
        .update({
          feedback:
            feedback.trim() || null,
          marks: numericMarks,
          status,
          reviewed_at:
            status === 'reviewed'
              ? new Date().toISOString()
              : null,
        })
        .eq('id', selected.id);

      if (error) throw error;

      closeReview();
      await loadSubmissions();
    } catch (error: any) {
      alert(
        error.message ||
          'Unable to save review.'
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(date: string) {
    if (!date) return '-';

    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }

  function getStatusClass(
    value: Submission['status']
  ) {
    switch (value) {
      case 'reviewed':
        return 'bg-green-50 text-green-700';

      case 'submitted':
        return 'bg-blue-50 text-blue-700';

      case 'in_progress':
        return 'bg-yellow-50 text-yellow-700';

      case 'overdue':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  const submittedCount = submissions.filter(
    (item) => item.status === 'submitted'
  ).length;

  const reviewedCount = submissions.filter(
    (item) => item.status === 'reviewed'
  ).length;

  return (
    <DashboardShell
      role="faculty"
      title="Submissions"
    >
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Student Submissions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review student task submissions and provide feedback.
          </p>
        </div>

        <button
          onClick={loadSubmissions}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Total Submissions
          </div>

          <div className="mt-2 text-3xl font-black">
            {submissions.length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Awaiting Review
          </div>

          <div className="mt-2 text-3xl font-black">
            {submittedCount}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Reviewed
          </div>

          <div className="mt-2 text-3xl font-black">
            {reviewedCount}
          </div>
        </div>
      </div>

      {/* Submissions */}
      <section className="card overflow-hidden">
        <div className="border-b p-5">
          <h3 className="font-extrabold">
            All Submissions
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Latest student submissions are shown first.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold">
              No submissions yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Student submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-4">
                    Student
                  </th>

                  <th className="px-5 py-4">
                    Task
                  </th>

                  <th className="px-5 py-4">
                    Submitted
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Marks
                  </th>

                  <th className="px-5 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold">
                        {submission.student_name}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {submission.student_email}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-[260px] truncate text-sm font-semibold">
                        {submission.task_title}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(
                        submission.submitted_at
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusClass(
                          submission.status
                        )}`}
                      >
                        {submission.status.replace(
                          '_',
                          ' '
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-bold">
                      {submission.marks !== null
                        ? submission.marks
                        : '-'}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          openReview(submission)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={14} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  Review Submission
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Review the student's work and add feedback.
                </p>
              </div>

              <button
                onClick={closeReview}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details */}
            <div className="grid gap-5 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-400">
                  Student
                </div>

                <div className="mt-1 font-extrabold">
                  {selected.student_name}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {selected.student_email}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400">
                  Task
                </div>

                <div className="mt-1 font-extrabold">
                  {selected.task_title}
                </div>
              </div>

              {selected.text_content && (
                <div>
                  <div className="text-xs font-semibold text-slate-400">
                    Student Response
                  </div>

                  <div className="mt-2 whitespace-pre-wrap rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
                    {selected.text_content}
                  </div>
                </div>
              )}

              {selected.file_urls &&
                selected.file_urls.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400">
                      Submitted Files
                    </div>

                    <div className="mt-2 space-y-2">
                      {selected.file_urls.map(
                        (url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            <ExternalLink size={15} />
                            File {index + 1}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selected.link_url && (
                <div>
                  <div className="text-xs font-semibold text-slate-400">
                    Submitted Link
                  </div>

                  <a
                    href={selected.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    <ExternalLink size={15} />
                    Open Submission Link
                  </a>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="label">
                  Status
                </label>

                <select
                  className="input"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target
                        .value as Submission['status']
                    )
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="submitted">
                    Submitted
                  </option>

                  <option value="reviewed">
                    Reviewed
                  </option>

                  <option value="overdue">
                    Overdue
                  </option>
                </select>
              </div>

              {/* Marks */}
              <div>
                <label className="label">
                  Marks
                </label>

                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="Enter marks"
                  value={marks}
                  onChange={(e) =>
                    setMarks(e.target.value)
                  }
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="label">
                  Feedback
                </label>

                <textarea
                  className="input min-h-32"
                  placeholder="Write feedback for the student..."
                  value={feedback}
                  onChange={(e) =>
                    setFeedback(e.target.value)
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t p-5">
              <button
                onClick={closeReview}
                disabled={saving}
                className="btn border bg-white text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={saveReview}
                disabled={saving}
                className="btn bg-[#07162d] text-white"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
