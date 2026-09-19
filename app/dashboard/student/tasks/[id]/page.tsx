'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Paperclip,
  RefreshCw,
  Send,
  Upload,
  X,
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

type Submission = {
  id: string;
  task_id: string;
  student_id: string;
  text_content: string | null;
  file_urls: string[] | null;
  link_url: string | null;
  status: string;
  feedback: string | null;
  marks: number | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export default function StudentTaskDetailPage() {
  const params = useParams();
  const router = useRouter();

  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [answer, setAnswer] = useState('');
  const [projectLink, setProjectLink] = useState('');

  const [uploadedFiles, setUploadedFiles] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  async function loadTask() {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      /*
       * Load task
       */
      const { data: taskData, error: taskError } =
        await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single();

      if (taskError) {
        throw taskError;
      }

      if (!taskData) {
        throw new Error('Task not found.');
      }

      setTask(taskData);

      /*
       * Check student's groups.
       */
      const { data: memberships } =
        await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

      const groupIds =
        memberships?.map(
          (item) => item.group_id
        ) || [];

      /*
       * Security check:
       *
       * General task
       * OR
       * task assigned to this student
       * OR
       * task assigned to student's group
       */
      const isGeneral =
        taskData.assigned_to === null &&
        taskData.group_id === null;

      const isPersonal =
        taskData.assigned_to === user.id;

      const isGroupTask =
        taskData.group_id !== null &&
        groupIds.includes(taskData.group_id);

      if (
        !isGeneral &&
        !isPersonal &&
        !isGroupTask
      ) {
        throw new Error(
          'You do not have access to this task.'
        );
      }

      /*
       * Load existing submission.
       */
      const { data: submissionData } =
        await supabase
          .from('task_submissions')
          .select('*')
          .eq('task_id', taskId)
          .eq('student_id', user.id)
          .order('submitted_at', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (submissionData) {
        setSubmission(submissionData);

        setAnswer(
          submissionData.text_content || ''
        );

        setProjectLink(
          submissionData.link_url || ''
        );

        setUploadedFiles(
          submissionData.file_urls || []
        );
      }
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'Unable to load task.'
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(
    date: string | null
  ) {
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

  function formatDateTime(
    date: string | null
  ) {
    if (!date) return '';

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

  function priorityClass(
    priority: string | null
  ) {
    if (priority === 'urgent') {
      return 'bg-red-50 text-red-600';
    }

    if (priority === 'high') {
      return 'bg-orange-50 text-orange-600';
    }

    return 'bg-slate-100 text-slate-600';
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) return;

    setUploading(true);
    setMessage('');
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          'User not logged in.'
        );
      }

      const newUrls: string[] = [];

      for (const file of files) {
        /*
         * Maximum 20 MB per file.
         */
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(
            `${file.name} is larger than 20 MB.`
          );
        }

        const safeName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        );

        const filePath =
          `submissions/${user.id}/${taskId}/${Date.now()}-${safeName}`;

        const { error: uploadError } =
          await supabase.storage
            .from('portal-files')
            .upload(
              filePath,
              file,
              {
                upsert: false,
                contentType:
                  file.type ||
                  'application/octet-stream',
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data } =
          supabase.storage
            .from('portal-files')
            .getPublicUrl(filePath);

        if (!data.publicUrl) {
          throw new Error(
            'Could not create file URL.'
          );
        }

        newUrls.push(data.publicUrl);
      }

      setUploadedFiles((previous) => [
        ...previous,
        ...newUrls,
      ]);

      setMessage(
        `${newUrls.length} file${
          newUrls.length > 1 ? 's' : ''
        } uploaded successfully.`
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'Unable to upload file.'
      );
    } finally {
      setUploading(false);

      /*
       * Allow selecting the same file again.
       */
      event.target.value = '';
    }
  }

  function removeFile(url: string) {
    setUploadedFiles((previous) =>
      previous.filter(
        (item) => item !== url
      )
    );
  }

  async function submitTask() {
    if (
      !answer.trim() &&
      uploadedFiles.length === 0 &&
      !projectLink.trim()
    ) {
      setError(
        'Please enter an answer, upload a file, or add a project link.'
      );

      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          'User not logged in.'
        );
      }

      const payload = {
        task_id: taskId,
        student_id: user.id,
        text_content:
          answer.trim() || null,
        file_urls: uploadedFiles,
        link_url:
          projectLink.trim() || null,
        status: 'submitted',
        submitted_at:
          new Date().toISOString(),
      };

      if (submission?.id) {
        const { data, error } =
          await supabase
            .from('task_submissions')
            .update(payload)
            .eq('id', submission.id)
            .select()
            .single();

        if (error) {
          throw error;
        }

        setSubmission(data);
      } else {
        const { data, error } =
          await supabase
            .from('task_submissions')
            .insert(payload)
            .select()
            .single();

        if (error) {
          throw error;
        }

        setSubmission(data);
      }

      setMessage(
        'Task submitted successfully.'
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'Unable to submit task.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell
        role="student"
        title="Task Details"
      >
        <div className="card p-12 text-center">

          <RefreshCw
            size={26}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-400">
            Loading task...
          </p>

        </div>
      </DashboardShell>
    );
  }

  if (error && !task) {
    return (
      <DashboardShell
        role="student"
        title="Task Details"
      >
        <div className="card p-10 text-center">

          <h2 className="text-xl font-black">
            Unable to open task
          </h2>

          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={() =>
              router.push(
                '/dashboard/student/tasks'
              )
            }
            className="btn mt-5 bg-[#07162d] text-white"
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </button>

        </div>
      </DashboardShell>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <DashboardShell
      role="student"
      title="Task Details"
    >
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Back */}
        <button
          onClick={() =>
            router.push(
              '/dashboard/student/tasks'
            )
          }
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Tasks
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        {/* Task Header */}
        <section className="card overflow-hidden">

          <div className="bg-[#07162d] p-7 text-white">

            <div className="flex flex-col justify-between gap-5 md:flex-row">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold capitalize text-cyan-300">
                    {task.priority || 'normal'}
                  </span>

                  {submission && (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300">
                      <CheckCircle2 size={13} />
                      Submitted
                    </span>
                  )}

                </div>

                <h1 className="mt-4 text-3xl font-black">
                  {task.title}
                </h1>

                {task.topic && (
                  <p className="mt-2 text-sm text-cyan-300">
                    Topic · {task.topic}
                  </p>
                )}

              </div>

              <div className="rounded-2xl bg-white/10 p-4 md:min-w-48">

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CalendarDays size={15} />
                  Deadline
                </div>

                <div className="mt-2 font-black">
                  {formatDate(task.deadline)}
                </div>

              </div>

            </div>

          </div>

          {/* Task information */}
          <div className="grid gap-5 p-6 md:grid-cols-3">

            <InfoBox
              icon={CalendarDays}
              label="Start Date"
              value={formatDate(task.start_date)}
            />

            <InfoBox
              icon={Clock3}
              label="Deadline"
              value={formatDate(task.deadline)}
            />

            <InfoBox
              icon={CheckCircle2}
              label="Maximum Marks"
              value={
                task.marks !== null
                  ? `${task.marks} marks`
                  : 'Not specified'
              }
            />

          </div>

        </section>

        {/* Description + Instructions */}
        <section className="grid gap-6 lg:grid-cols-2">

          <div className="card p-6">

            <h2 className="text-lg font-black">
              Description
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {task.description ||
                'No description provided.'}
            </p>

          </div>

          <div className="card p-6">

            <h2 className="text-lg font-black">
              Instructions
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {task.instructions ||
                'No specific instructions provided.'}
            </p>

          </div>

        </section>

        {/* Faculty attachment */}
        {task.attachment_url && (
          <section className="card p-6">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Paperclip size={20} />
                </div>

                <div>
                  <h2 className="font-black">
                    Faculty Attachment
                  </h2>

                  <p className="text-xs text-slate-400">
                    Reference file provided by faculty.
                  </p>
                </div>

              </div>

              <a
                href={task.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[#07162d] text-white"
              >
                <FileText size={16} />
                Open File
                <ExternalLink size={14} />
              </a>

            </div>

          </section>
        )}

        {/* Submission */}
        <section className="card overflow-hidden">

          <div className="border-b p-6">

            <h2 className="text-xl font-black">
              Your Submission
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Submit your answer, project files and project link.
            </p>

          </div>

          <div className="space-y-6 p-6">

            {/* Answer */}
            <div>

              <label className="label">
                Your Answer
              </label>

              <textarea
                className="input min-h-40"
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                placeholder="Write your answer / explanation here..."
              />

            </div>

            {/* Upload */}
            <div>

              <label className="label">
                Upload Project / Answer Files
              </label>

              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6">

                <label className="flex cursor-pointer flex-col items-center justify-center text-center">

                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    {uploading ? (
                      <RefreshCw
                        size={23}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload size={23} />
                    )}
                  </div>

                  <div className="mt-3 font-bold">
                    {uploading
                      ? 'Uploading files...'
                      : 'Choose files'}
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    PDF, DOC, PPT, ZIP, images and project files
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Maximum 20 MB per file
                  </p>

                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />

                </label>

              </div>

            </div>

            {/* Uploaded files */}
            {uploadedFiles.length > 0 && (
              <div>

                <h3 className="mb-3 text-sm font-black">
                  Uploaded Files
                </h3>

                <div className="space-y-2">

                  {uploadedFiles.map(
                    (url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 p-3"
                      >

                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 items-center gap-3 text-sm font-semibold text-blue-600"
                        >
                          <FileText
                            size={17}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            File {index + 1}
                          </span>
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            removeFile(url)
                          }
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-white text-red-500"
                        >
                          <X size={15} />
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* Project link */}
            <div>

              <label className="label">
                GitHub / Project / Demo Link
              </label>

              <input
                className="input"
                value={projectLink}
                onChange={(e) =>
                  setProjectLink(e.target.value)
                }
                placeholder="https://github.com/... or project URL"
              />

            </div>

            {/* Submit */}
            <div className="flex justify-end border-t pt-6">

              <button
                onClick={submitTask}
                disabled={
                  submitting ||
                  uploading
                }
                className="btn bg-[#07162d] text-white"
              >
                {submitting ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={16} />
                )}

                {submitting
                  ? 'Submitting...'
                  : submission
                  ? 'Update Submission'
                  : 'Submit Task'}
              </button>

            </div>

          </div>

        </section>

        {/* Faculty feedback */}
        {submission &&
          (submission.feedback ||
            submission.marks !== null) && (
            <section className="card p-6">

              <h2 className="text-lg font-black">
                Faculty Review
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {submission.marks !== null && (
                  <div className="rounded-xl bg-blue-50 p-4">

                    <div className="text-xs font-bold text-blue-600">
                      Marks
                    </div>

                    <div className="mt-1 text-2xl font-black text-blue-700">
                      {submission.marks}
                      {task.marks !== null
                        ? ` / ${task.marks}`
                        : ''}
                    </div>

                  </div>
                )}

                {submission.feedback && (
                  <div className="rounded-xl bg-slate-50 p-4">

                    <div className="text-xs font-bold text-slate-400">
                      Faculty Feedback
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {submission.feedback}
                    </p>

                  </div>
                )}

              </div>

              <div className="mt-4 text-xs text-slate-400">
                Submitted ·{' '}
                {formatDateTime(
                  submission.submitted_at
                )}
              </div>

            </section>
          )}

      </div>
    </DashboardShell>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Icon size={15} />
        {label}
      </div>

      <div className="mt-2 text-sm font-black text-slate-700">
        {value}
      </div>

    </div>
  );
}
