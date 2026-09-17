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

  async function loadStudents() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, department, year, section')
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

          <button
            onClick={loadStudents}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Students
          </button>
        </div>

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

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">Unable to load students</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold">Department</th>
                  <th className="p-4 font-bold">Year</th>
                  <th className="p-4 font-bold">Section</th>
                  <th className="p-4 font-bold">Status</th>
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
                      No students found in Supabase.
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

      </div>
    </main>
  );
}
