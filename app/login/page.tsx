'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  ArrowLeft,
} from 'lucide-react';

import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabase';

type ApprovedRole = 'student' | 'faculty';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<'email' | 'login' | 'signup'>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [designation, setDesignation] = useState('');

  const [role, setRole] = useState<ApprovedRole>(
    params.get('role') === 'faculty' ? 'faculty' : 'student'
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function checkEmail(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();

   // Existing admin account is allowed to login
if (cleanEmail === 's32214840@gmail.com') {
  setRole('faculty');
  setMode('login');
  setLoading(false);
  return;
}

// Students and faculty must use college email
if (!cleanEmail.endsWith('@ece.ritchennai.edu.in')) {
  setError(
    'Only Rajalakshmi Institute of Technology ECE college emails are allowed.'
  );
  setLoading(false);
  return;
}
    const { data: approval, error: approvalError } = await supabase.rpc(
      'check_approved_email',
      {
        p_email: cleanEmail,
      }
    );

    if (approvalError) {
      setError(approvalError.message);
      setLoading(false);
      return;
    }

    if (!approval || approval.length === 0 || !approval[0]?.approved) {
      setError(
        'This email has not been approved by the Faculty. Please contact the Faculty.'
      );
      setLoading(false);
      return;
    }

    const approvedRole = approval[0].role as ApprovedRole;

    setRole(approvedRole);

    /*
     * Check whether an Auth account already exists.
     *
     * We cannot safely check Supabase Auth users directly from
     * the browser. Instead, try to continue with the approved
     * email. New users will use Sign Up, existing users can use
     * Sign In.
     */
    setMode('signup');
    setLoading(false);
  }

  async function signUp(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          department: department.trim(),
          year: year.trim(),
          section: section.trim(),
          designation: designation.trim(),
        },
      },
    });

    if (signUpError) {
      if (
        signUpError.message.toLowerCase().includes('already registered') ||
        signUpError.message.toLowerCase().includes('already exists')
      ) {
        setMode('login');
        setError(
          'This email already has an account. Please sign in using your password.'
        );
      } else {
        setError(signUpError.message);
      }

      setLoading(false);
      return;
    }

    if (data.user) {
      setMessage(
        'Account created successfully. Please sign in with your email and password.'
      );

      setPassword('');
      setConfirmPassword('');
      setMode('login');
    }

    setLoading(false);
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError('Profile not found. Please contact the Faculty.');
      setLoading(false);
      return;
    }

    if (profile.role === 'student') {
      router.push('/dashboard/student');
    } else if (
      profile.role === 'faculty' ||
      profile.role === 'admin'
    ) {
      router.push('/dashboard/faculty');
    } else {
      await supabase.auth.signOut();
      setError('Invalid account role.');
    }

    setLoading(false);
  }

  function resetToEmail() {
    setMode('email');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_20%,#dffaff,transparent_30%),#f6f8fc] p-5">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[30px] bg-white shadow-2xl lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden bg-[#07162d] p-12 text-white lg:block">
          <Logo />

          <div className="mt-24">
            <div className="text-sm font-bold uppercase tracking-[.2em] text-cyan-300">
              Secure access
            </div>

            <h1 className="mt-4 text-5xl font-black leading-tight">
              One portal for the entire IoT ecosystem.
            </h1>

            <p className="mt-5 max-w-md leading-7 text-slate-400">
              Collaborate with faculty, track project work, submit tasks and
              stay connected to your center.
            </p>

            <div className="mt-10 flex gap-3">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="text-cyan-300" />

                <div className="mt-3 font-bold">
                  Role-based
                </div>

                <div className="text-xs text-slate-400">
                  Protected workspaces
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <LockKeyhole className="text-blue-300" />

                <div className="mt-3 font-bold">
                  Secure
                </div>

                <div className="text-xs text-slate-400">
                  Supabase Auth + RLS
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="p-7 sm:p-12">
          <Logo />

          <div className="mt-10">

            {/* EMAIL SCREEN */}
            {mode === 'email' && (
              <>
                <h2 className="text-3xl font-black">
                  Welcome
                </h2>

                <p className="mt-2 text-slate-500">
                  Enter your approved college email to continue.
                </p>

                <form onSubmit={checkEmail} className="mt-7 space-y-5">

                  <label className="block text-sm font-bold">
                    College Email

                    <div className="relative mt-2">
                      <Mail
                        className="absolute left-3 top-3.5 text-slate-400"
                        size={18}
                      />

                      <input
                        required
                        autoFocus
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                        placeholder="you@ece.ritchennai.edu.in"
                      />
                    </div>
                  </label>

                  {error && (
                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    className="btn btn-primary w-full py-3.5"
                  >
                    {loading
                      ? 'Checking email…'
                      : 'Continue'}
                  </button>

                </form>

                <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck size={14} />
                  Only Faculty-approved college emails can access the portal.
                </div>
              </>
            )}

            {/* SIGNUP SCREEN */}
            {mode === 'signup' && (
              <>
                <button
                  onClick={resetToEmail}
                  className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"
                >
                  <ArrowLeft size={16} />
                  Change email
                </button>

                <h2 className="text-3xl font-black">
                  Create Account
                </h2>

                <p className="mt-2 text-slate-500">
                  Approved as{' '}
                  <span className="font-bold capitalize text-blue-600">
                    {role}
                  </span>
                  .
                </p>

                <form onSubmit={signUp} className="mt-6 space-y-4">

                  <label className="block text-sm font-bold">
                    Full Name

                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </label>

                  <label className="block text-sm font-bold">
                    Department

                    <input
                      required
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="ECE"
                    />
                  </label>

                  {role === 'student' ? (
                    <div className="grid grid-cols-2 gap-3">

                      <label className="block text-sm font-bold">
                        Year

                        <input
                          required
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                          placeholder="3rd Year"
                        />
                      </label>

                      <label className="block text-sm font-bold">
                        Section

                        <input
                          required
                          type="text"
                          value={section}
                          onChange={(e) => setSection(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                          placeholder="A"
                        />
                      </label>

                    </div>
                  ) : (
                    <label className="block text-sm font-bold">
                      Designation

                      <input
                        required
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                        placeholder="Assistant Professor"
                      />
                    </label>
                  )}

                  <label className="block text-sm font-bold">
                    Password

                    <div className="relative mt-2">
                      <LockKeyhole
                        className="absolute left-3 top-3.5 text-slate-400"
                        size={18}
                      />

                      <input
                        required
                        minLength={6}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 outline-none focus:border-blue-500"
                        placeholder="Minimum 6 characters"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="block text-sm font-bold">
                    Confirm Password

                    <div className="relative mt-2">
                      <LockKeyhole
                        className="absolute left-3 top-3.5 text-slate-400"
                        size={18}
                      />

                      <input
                        required
                        minLength={6}
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 outline-none focus:border-blue-500"
                        placeholder="Re-enter password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-3.5 text-slate-400"
                      >
                        {showConfirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>

                  {error && (
                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    className="btn btn-primary w-full py-3.5"
                  >
                    {loading
                      ? 'Creating account…'
                      : 'Create Account'}
                  </button>

                </form>

                <div className="mt-5 text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="font-bold text-blue-600"
                  >
                    Sign in
                  </button>
                </div>
              </>
            )}

            {/* LOGIN SCREEN */}
            {mode === 'login' && (
              <>
                <button
                  onClick={resetToEmail}
                  className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"
                >
                  <ArrowLeft size={16} />
                  Change email
                </button>

                <h2 className="text-3xl font-black">
                  Welcome back
                </h2>

                <p className="mt-2 text-slate-500">
                  Sign in to your{' '}
                  <span className="font-bold capitalize">
                    {role}
                  </span>{' '}
                  workspace.
                </p>

                <form onSubmit={signIn} className="mt-6 space-y-5">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-bold text-slate-400">
                      EMAIL
                    </div>

                    <div className="mt-1 flex items-center gap-2 font-bold text-slate-800">
                      <Mail size={16} />
                      {email}
                    </div>
                  </div>

                  <label className="block text-sm font-bold">
                    Password

                    <div className="relative mt-2">
                      <LockKeyhole
                        className="absolute left-3 top-3.5 text-slate-400"
                        size={18}
                      />

                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 outline-none focus:border-blue-500"
                        placeholder="••••••••"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>

                  {message && (
                    <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                      {message}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    className="btn btn-primary w-full py-3.5"
                  >
                    {loading
                      ? 'Signing in…'
                      : `Sign in as ${role}`}
                  </button>

                  <button
                    type="button"
                    className="w-full text-sm font-bold text-blue-600"
                  >
                    Forgot password?
                  </button>

                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  First time here?{' '}
                  <button
                    onClick={() => {
                      setMode('email');
                      setError('');
                      setMessage('');
                    }}
                    className="font-bold text-blue-600"
                  >
                    Check your email
                  </button>
                </div>
              </>
            )}

            <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">
              <UserRound size={14} />
              Secure authentication powered by Supabase Auth.
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
