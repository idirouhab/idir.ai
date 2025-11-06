'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function Unsubscribe() {
  const t = useTranslations('unsubscribe');
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-populate email from URL parameter if provided (for email links)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      // Decode and sanitize email
      const decodedEmail = decodeURIComponent(emailParam);
      // Basic email validation
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedEmail)) {
        setEmail(decodedEmail);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t('form.invalidEmail'));
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('https://idir-test.app.n8n.cloud/webhook/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          action: 'unsubscribe'
        }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || t('form.error'));
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage(t('form.error'));
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#050505' }}>
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-black border-2 border-[#ff0055] p-8 sm:p-12 relative overflow-hidden">
          {/* Corner markers */}
          <div className="absolute top-3 left-3 w-4 h-4 bg-[#ff0055]"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 bg-[#ff0055]"></div>
          <div className="absolute top-3 right-3 w-4 h-4 bg-gray-700"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 bg-gray-700"></div>

          <div className="relative z-10">
            {status === 'success' ? (
              // Success state
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {t('success.title')}
                  </h1>
                  <p className="text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
                    {t('success.message')}
                  </p>
                </div>

                <div className="border-t-2 border-gray-800 pt-8">
                  <p className="text-sm text-gray-500 mb-4">
                    {t('success.feedback')}
                  </p>
                  <a
                    href="/"
                    className="inline-block px-8 py-3 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
                  >
                    {t('success.backHome')}
                  </a>
                </div>
              </div>
            ) : (
              // Form state
              <>
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-1 w-12 bg-[#ff0055]"></div>
                    <span className="text-[#ff0055] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
                    <div className="h-1 flex-1 bg-[#ff0055]"></div>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {t('title')}
                  </h1>

                  <p className="text-base text-gray-300 leading-relaxed max-w-xl">
                    {t('description')}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-white font-bold mb-2 uppercase text-sm">
                      {t('form.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={t('form.emailPlaceholder')}
                      className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-700 focus:border-[#ff0055] focus:outline-none transition-colors"
                      disabled={status === 'sending'}
                    />
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <div className="p-4 border-2 border-[#ff0055] bg-[#ff005510] text-[#ff0055]">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full px-8 py-4 bg-[#ff0055] text-white font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {status === 'sending' ? t('form.sending') : t('form.submit')}
                  </button>
                </form>

                {/* Additional info */}
                <div className="border-t-2 border-gray-800 pt-8 mt-8">
                  <p className="text-sm text-gray-500">
                    {t('footer')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-[#ff0055] transition-colors uppercase tracking-wide font-bold"
          >
            {t('backLink')}
          </a>
        </div>
      </div>
    </div>
  );
}