'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        window.location.href = '/admin';
        return;
      }

      setError(data.error || 'Invalid email or password');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e3e9f1] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#11b981]">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to access idir.ai admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-shell"
              placeholder="you@company.com"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-shell"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <div>
            <Link href="/admin/signup" className="font-medium text-[#0f9f73] hover:text-[#0b7a58]">
              Don&apos;t have an account? Sign up
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
