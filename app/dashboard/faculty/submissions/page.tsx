'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  task_id: string | null;
  student_id: string | null;
  text_content: string | null;
  file_urls: string[] | null;
  link_url: string | null;
  status: string;
  feedback: string | null;
  marks: number | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSubmissions() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('task_submissions')
      .select(
        'id, task_id, student_id, text_content, file_urls, link_url, status, feedback, marks, submitted_at, reviewed_at'
      )
      .order('submitted_at', { ascending: false });

    if (error) {
      setError(error.message);
      setSubmissions([]);
    } else {
      setSubmissions(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSubmissions();
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
              Submissions
            </h1>

            <p className="mt-2 text-slate-500">
              Review student task submissions.
            </p>
          </div>

          <button
            onClick={loadSubmissions}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Submissions
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Submissions
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {submissions.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Review
            </p>

            <p className="mt-2 text-3xl font-black text-orange-500">
              {
                submissions.filter(
                  (item) =>
                    item.status.toLowerCase() === 'submitted'
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Reviewed
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {
                submissions.filter(
                  (item) =>
                    item.status.toLowerCase() === 'reviewed'
                ).length
              }
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load submissions
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Submission List */}
        <div className="space-y-5">

          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">📥</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No submissions yet
              </h2>

              <p className="mt-2 text-slate-500">
                Student submissions will appear here.
              </p>
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md"
              >

                {/* Top */}
                <div className="flex flex-col justify-between gap-4 md:flex-row">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Submission
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Task ID: {submission.task_id || 'Not available'}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Student ID: {submission.student_id || 'Not available'}
                    </p>
                  </div>

                  <span
                    className={`h-fit rounded-full px-4 py-2 text-xs font-bold ${
                      submission.status.toLowerCase() === 'reviewed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {submission.status}
                  </span>

                </div>

                {/* Text */}
                {submission.text_content && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">
                      Student Response
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {submission.text_content}
                    </p>
                  </div>
                )}

                {/* Files */}
                {submission.file_urls &&
                  submission.file_urls.length > 0 && (
                    <div className="mt-5">
                      <p className="text-sm font-bold text-slate-700">
                        Attached Files
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {submission.file_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100"
                          >
                            📎 File {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Link */}
                {submission.link_url && (
                  <div className="mt-4">
                    <a
                      href={submission.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
                    >
                      🔗 Open Submission Link
                    </a>
                  </div>
                )}

                {/* Feedback */}
                {submission.feedback && (
                  <div className="mt-5 rounded-xl bg-green-50 p-4">
                    <p className="text-sm font-bold text-green-700">
                      Faculty Feedback
                    </p>

                    <p className="mt-2 text-sm text-green-800">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {/* Bottom */}
                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">

                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                    Submitted:{' '}
                    {new Date(
                      submission.submitted_at
                    ).toLocaleString()}
                  </span>

                  {submission.marks !== null && (
                    <span className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">
                      Marks: {submission.marks}
                    </span>
                  )}

                  {submission.reviewed_at && (
                    <span className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                      Reviewed:{' '}
                      {new Date(
                        submission.reviewed_at
                      ).toLocaleDateString()}
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
