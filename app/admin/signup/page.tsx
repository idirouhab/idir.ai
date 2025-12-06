'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
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

    // Client-side validation
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (error) {
      console.error('Signup error:', error);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0a0a' }}>
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#00CFFF' }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#FF6B6B' }}></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="border-4 p-8 md:p-12 text-center" style={{
            background: '#000',
            borderColor: '#00ff88',
            boxShadow: '0 0 50px #00ff8850'
          }}>
            {/* Corner markers */}
            <div className="absolute top-3 left-3 w-4 h-4" style={{ background: '#00ff88' }}></div>
            <div className="absolute top-3 right-3 w-4 h-4" style={{ background: '#00cfff' }}></div>
            <div className="absolute bottom-3 left-3 w-4 h-4" style={{ background: '#00cfff' }}></div>
            <div className="absolute bottom-3 right-3 w-4 h-4" style={{ background: '#00ff88' }}></div>

            <div className="w-20 h-20 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-black text-white mb-4 uppercase">Account Created!</h1>
            <p className="text-gray-300 mb-6">
              Your blogger account has been created successfully. Please wait for the site owner to approve your account before you can log in.
            </p>

            <div className="space-y-3">
              <Link
                href="/admin/login"
                className="block w-full px-8 py-4 bg-[#00cfff] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
                style={{
                  boxShadow: '0 0 30px #00cfff50'
                }}
              >
                Go to Login
              </Link>
              <Link
                href="/"
                className="block text-gray-300 hover:text-[#00ff88] transition-colors text-sm"
              >
                ← Back to site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0a0a0a' }}>
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#00CFFF' }}></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#FF6B6B' }}></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="border-4 p-8 md:p-12" style={{
          background: '#000',
          borderColor: '#00cfff',
          boxShadow: '0 0 50px #00cfff50'
        }}>
          {/* Corner markers */}
          <div className="absolute top-3 left-3 w-4 h-4" style={{ background: '#00cfff' }}></div>
          <div className="absolute top-3 right-3 w-4 h-4" style={{ background: '#00ff88' }}></div>
          <div className="absolute bottom-3 left-3 w-4 h-4" style={{ background: '#00ff88' }}></div>
          <div className="absolute bottom-3 right-3 w-4 h-4" style={{ background: '#00cfff' }}></div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2 uppercase">Blogger Signup</h1>
            <p className="text-gray-300">Create your blogger account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white font-bold mb-2 uppercase text-sm">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00cfff] focus:outline-none focus:border-[#00ff88] transition-colors"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-white font-bold mb-2 uppercase text-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00cfff] focus:outline-none focus:border-[#00ff88] transition-colors"
                placeholder="john@example.com"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00cfff] focus:outline-none focus:border-[#00ff88] transition-colors"
                placeholder="At least 8 characters"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white font-bold mb-2 uppercase text-sm">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-[#00cfff] focus:outline-none focus:border-[#00ff88] transition-colors"
                placeholder="Re-enter password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-4 border-2 border-[#ff0055] bg-[#ff005520] text-[#ff0055]">
                {error}
              </div>
            )}

            <div className="p-4 bg-[#00cfff20] border-2 border-[#00cfff]">
              <p className="text-[#00cfff] text-xs">
                Note: Your account will need to be approved by the site owner before you can log in.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-[#00cfff] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 0 30px #00cfff50'
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div>
              <Link
                href="/admin/login"
                className="text-[#00cfff] hover:text-[#00ff88] transition-colors text-sm font-bold"
              >
                Already have an account? Log in →
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm"
              >
                ← Back to site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
