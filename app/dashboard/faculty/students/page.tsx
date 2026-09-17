'use client';

import { useState } from 'react';

const initialStudents = [
  {
    name: 'Arun Kumar',
    email: 'arun@example.com',
    department: 'ECE',
    year: '3rd Year',
    status: 'Active',
  },
  {
    name: 'Santhosh',
    email: 'santhosh@example.com',
    department: 'ECE',
    year: '3rd Year',
    status: 'Active',
  },
  {
    name: 'Vignesh',
    email: 'vignesh@example.com',
    department: 'ECE',
    year: '3rd Year',
    status: 'Active',
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState(initialStudents);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('ECE');
  const [year, setYear] = useState('3rd Year');

  function addStudent(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email) return;

    setStudents([
      ...students,
      {
        name,
        email,
        department,
        year,
        status: 'Active',
      },
    ]);

    setName('');
    setEmail('');
    setShowForm(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

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
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            + Add Student
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={addStudent}
            className="mb-8 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-black text-slate-900">
              Add New Student
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student name"
                className="rounded-xl border p-3 outline-none focus:border-blue-500"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                className="rounded-xl border p-3 outline-none focus:border-blue-500"
              />

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="rounded-xl border p-3"
              >
                <option>ECE</option>
                <option>EEE</option>
                <option>CSE</option>
                <option>MECH</option>
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-xl border p-3"
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
            >
              Save Student
            </button>
          </form>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-slate-500">Total Students</p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-slate-500">Active Students</p>
            <p className="mt-2 text-3xl font-black text-green-600">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-slate-500">Department</p>
            <p className="mt-2 text-3xl font-black text-blue-600">ECE</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold">Department</th>
                  <th className="p-4 font-bold">Year</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">
                        {student.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {student.email}
                      </p>
                    </td>

                    <td className="p-4 text-slate-600">
                      {student.department}
                    </td>

                    <td className="p-4 text-slate-600">
                      {student.year}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
