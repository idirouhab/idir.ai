'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#e3e9f1] px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Account Created</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your admin account request was submitted. A super admin must approve it before login.
          </p>
          <div className="mt-6 space-y-2">
            <Link href="/admin/login" className="btn-primary w-full">
              Go to Login
            </Link>
            <Link href="/" className="inline-block text-sm text-slate-600 hover:text-slate-900">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e3e9f1] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#11b981]">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create Account</h1>
          <p className="mt-2 text-sm text-slate-600">Request access to the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-shell"
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-shell"
              placeholder="john@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-shell"
              placeholder="At least 8 characters"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input-shell"
              placeholder="Re-enter password"
              required
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            New admin accounts require super-admin approval before login.
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <div>
            <Link href="/admin/login" className="font-medium text-[#0f9f73] hover:text-[#0b7a58]">
              Already have an account? Log in
            </Link>
          </div>
          <div>
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
