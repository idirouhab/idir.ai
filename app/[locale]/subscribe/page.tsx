'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Subscribe() {
  const t = useTranslations('subscribe');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('https://idir-test.app.n8n.cloud/webhook/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          language,
          action: 'subscribe'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#050505' }}>
      <div className="w-full max-w-3xl">
        {/* Main Card */}
        <div className="bg-black border-2 border-[#00ff88] p-8 sm:p-12 relative overflow-hidden">
          {/* Corner markers */}
          <div className="absolute top-3 left-3 w-4 h-4 bg-[#00ff88]"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 bg-[#00ff88]"></div>
          <div className="absolute top-3 right-3 w-4 h-4 bg-[#ff0055]"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 bg-[#ff0055]"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1 w-12 bg-[#ff0055]"></div>
                <span className="text-[#ff0055] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
                <div className="h-1 flex-1 bg-[#ff0055]"></div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                {t('title1')}
                <br />
                <span className="gradient-text glow-text">{t('title2')}</span>
              </h1>

              <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
                {t('description')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mb-10">
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
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none transition-colors"
                  disabled={status === 'sending'}
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-3 uppercase text-sm">
                  {t('form.language')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-3 border-2 font-bold uppercase text-sm transition-all ${
                      language === 'en'
                        ? 'bg-[#00ff88] text-black border-[#00ff88]'
                        : 'bg-[#0a0a0a] text-gray-400 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {t('form.languageEn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('es')}
                    className={`px-4 py-3 border-2 font-bold uppercase text-sm transition-all ${
                      language === 'es'
                        ? 'bg-[#00ff88] text-black border-[#00ff88]'
                        : 'bg-[#0a0a0a] text-gray-400 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {t('form.languageEs')}
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="p-4 border-2 border-[#00ff88] bg-[#00ff8810] text-[#00ff88]">
                  {t('form.success')}
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 border-2 border-[#ff0055] bg-[#ff005510] text-[#ff0055]">
                  {t('form.error')}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {status === 'sending' ? t('form.sending') : t('form.submit')}
              </button>
            </form>

            {/* What you'll get */}
            <div className="border-t-2 border-gray-800 pt-8">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-4">{t('whatYouGet')}</p>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#00ff88] mt-1">→</span>
                  <span>{t('benefits.daily')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00ff88] mt-1">→</span>
                  <span>{t('benefits.language')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00ff88] mt-1">→</span>
                  <span>{t('benefits.unsubscribe')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-wide font-bold"
          >
            {t('backLink')}
          </a>
        </div>
      </div>
    </div>
  );
}
