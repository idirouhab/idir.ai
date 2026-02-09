'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
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
        // Redirect to admin panel
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Invalid email or password');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="section-pad">
        <div className="max-w-md mx-auto">
          <div className="card-surface">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-1 w-8 bg-[#11b981]"></div>
                <span className="section-kicker">Admin</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 tracking-tight">Admin Login</h1>
              <p className="text-sm text-[#9ca3af]">Sign in to access the admin panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-white font-semibold mb-2 uppercase text-xs tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black text-white border border-[#1f2937] rounded focus:outline-none focus:border-[#11b981] transition-colors"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-semibold mb-2 uppercase text-xs tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black text-white border border-[#1f2937] rounded focus:outline-none focus:border-[#11b981] transition-colors"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-4 border border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444] rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-[#11b981] text-black font-semibold uppercase tracking-wide rounded hover:bg-[#0f9f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div>
              <Link
                href="/admin/signup"
                className="text-[#11b981] hover:text-[#0f9f73] transition-colors text-xs font-semibold uppercase tracking-wider"
              >
                Don&apos;t have an account? Sign up →
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="text-[#9ca3af] hover:text-[#11b981] transition-colors text-xs uppercase tracking-wider"
              >
                ← Back to site
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
