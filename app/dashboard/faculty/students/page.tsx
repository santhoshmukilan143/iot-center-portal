'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Student = {
  id: string;
  full_name: string;
  email: string | null;
  department: string | null;
  year: string | null;
  section: string | null;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'faculty'>('student');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState('');

  async function loadStudents() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, full_name, email, department, year, section'
      )
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (error) {
      setError(error.message);
      setStudents([]);
    } else {
      setStudents(data || []);
    }

    setLoading(false);
  }

  async function addUser() {
    setError('');
    setSuccess('');

    const email = studentEmail.trim().toLowerCase();

    if (!email) {
      setError('Please enter the college email.');
      return;
    }

    if (!email.endsWith('@ece.ritchennai.edu.in')) {
      setError(
        'Only Rajalakshmi Institute of Technology ECE college emails are allowed.'
      );
      return;
    }

    setAdding(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Faculty session not found. Please login again.');
      setAdding(false);
      return;
    }

    const { error } = await supabase
      .from('approved_students')
      .insert({
        email,
        role: userRole,
        created_by: user.id,
      });

    if (error) {
      if (error.code === '23505') {
        setError('This email is already approved.');
      } else {
        setError(error.message);
      }

      setAdding(false);
      return;
    }

    setSuccess(
      `${userRole === 'student' ? 'Student' : 'Faculty'} email approved successfully.`
    );

    setStudentEmail('');
    setUserRole('student');
    setShowAddStudent(false);
    setAdding(false);

    await loadStudents();
  }

  useEffect(() => {
    loadStudents();
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
              Students
            </h1>

            <p className="mt-2 text-slate-500">
              Manage students registered in the IoT Innovation Center.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={loadStudents}
              className="rounded-xl border bg-white px-5 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ↻ Refresh
            </button>

            <button
              onClick={() => {
                setError('');
                setSuccess('');
                setStudentEmail('');
                setUserRole('student');
                setShowAddStudent(true);
              }}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
            >
              + Add User
            </button>

          </div>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <p className="font-bold">
              Success
            </p>

            <p className="mt-1 text-sm">
              {success}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to complete request
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Students
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Students
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Department
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              ECE
            </p>
          </div>

        </div>

        {/* Students Table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 font-bold">
                    Student
                  </th>

                  <th className="p-4 font-bold">
                    Department
                  </th>

                  <th className="p-4 font-bold">
                    Year
                  </th>

                  <th className="p-4 font-bold">
                    Section
                  </th>

                  <th className="p-4 font-bold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-slate-500"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-slate-500"
                    >
                      No students have created their accounts yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-t hover:bg-slate-50"
                    >

                      <td className="p-4">
                        <p className="font-bold text-slate-900">
                          {student.full_name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {student.email || 'No email'}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {student.department || '-'}
                      </td>

                      <td className="p-4 text-slate-600">
                        {student.year || '-'}
                      </td>

                      <td className="p-4 text-slate-600">
                        {student.section || '-'}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                          Active
                        </span>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>
        </div>

        {/* Add User Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Add User
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Approve a college email for portal access.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddStudent(false)}
                  className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100"
                >
                  ×
                </button>

              </div>

              {/* Email */}
              <div className="mt-6">

                <label className="text-sm font-bold text-slate-700">
                  College Email
                </label>

                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="name@ece.ritchennai.edu.in"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Only @ece.ritchennai.edu.in emails are accepted.
                </p>

              </div>

              {/* Role */}
              <div className="mt-6">

                <label className="text-sm font-bold text-slate-700">
                  User Role
                </label>

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setUserRole('student')}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      userRole === 'student'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black">
                      👨‍🎓 Student
                    </div>

                    <div className="mt-1 text-xs">
                      Student Dashboard
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRole('faculty')}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      userRole === 'faculty'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black">
                      👨‍🏫 Faculty
                    </div>

                    <div className="mt-1 text-xs">
                      Faculty Dashboard
                    </div>
                  </button>

                </div>

              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">

                <button
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 rounded-xl border bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={addUser}
                  disabled={adding}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding ? 'Approving...' : 'Approve User'}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
