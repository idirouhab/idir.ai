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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0a0a' }}>
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#00CFFF' }}></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#FF6B6B' }}></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="border-4 p-8 md:p-12" style={{
          background: '#000',
          borderColor: '#00ff88',
          boxShadow: '0 0 50px #00ff8850'
        }}>
          {/* Corner markers */}
          <div className="absolute top-3 left-3 w-4 h-4" style={{ background: '#00ff88' }}></div>
          <div className="absolute top-3 right-3 w-4 h-4" style={{ background: '#ff0055' }}></div>
          <div className="absolute bottom-3 left-3 w-4 h-4" style={{ background: '#ff0055' }}></div>
          <div className="absolute bottom-3 right-3 w-4 h-4" style={{ background: '#00ff88' }}></div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2 uppercase">Admin Login</h1>
            <p className="text-gray-300">Sign in to access the admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-white font-bold mb-2 uppercase text-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00ff88] focus:outline-none focus:border-[#00cfff] transition-colors"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-bold mb-2 uppercase text-sm">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00ff88] focus:outline-none focus:border-[#00cfff] transition-colors"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-4 border-2 border-[#ff0055] bg-[#ff005520] text-[#ff0055]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 0 30px #00ff8850'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div>
              <Link
                href="/admin/signup"
                className="text-[#00cfff] hover:text-[#00ff88] transition-colors text-sm font-bold"
              >
                Don&apos;t have an account? Sign up →
              </Link>
            </div>
            <div>
              <a
                href="/"
                className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm"
              >
                ← Back to site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
