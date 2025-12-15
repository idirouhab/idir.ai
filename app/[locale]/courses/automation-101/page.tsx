'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function Automation101() {
  const t = useTranslations('courses.automation101');
  const locale = useLocale();
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/courses/automation-101/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          language: locale,
          termsAccepted: termsAccepted,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ fullName: '', email: '' });
        setTermsAccepted(false);
      } else {
        setStatus('error');
        if (response.status === 409) {
          setErrorMessage(t('form.errorDuplicate'));
        } else {
          setErrorMessage(t('form.error'));
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setStatus('error');
      setErrorMessage(t('form.error'));
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff0055] opacity-10 rounded-full blur-3xl"></div>
      </div>

      {status !== 'success' ? (
        // Main Content View
        <div className="relative z-10 h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-[#00ff88] text-black font-black uppercase text-sm">
                  {t('hero.badge')}
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                  {t('hero.title')}
                </h1>
                <div className="flex items-center gap-3 ml-6">
                  <div className="px-4 py-2 bg-[#00ff88] text-black font-black text-lg uppercase">
                    100% GRATIS
                  </div>
                  <div className="text-sm text-gray-400">
                    {t('hero.price.optionalSupport')}
                  </div>
                </div>
              </div>
              <Link
                href={`/${locale}`}
                className="text-sm text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-wide font-bold"
              >
                {t('backLink')}
              </Link>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-3 gap-8 p-8">
              {/* Left Column - Course Info */}
              <div className="col-span-2 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                {/* Hero Description with CTA */}
                <div className="border-2 border-[#00ff88] bg-black p-10 relative">
                  <div className="absolute top-3 left-3 w-3 h-3 bg-[#00ff88]"></div>
                  <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#00ff88]"></div>
                  <h2 className="text-4xl font-bold text-[#00ff88] mb-6 uppercase">
                    {t('overview.title')}
                  </h2>
                  <p className="text-xl text-gray-300 leading-relaxed mb-8">
                    {t('overview.intro')}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={scrollToForm}
                    className="px-12 py-5 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform text-xl"
                  >
                    REGISTRARTE →
                  </button>
                </div>

                {/* Why This Course - 2 reasons directly */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-2 border-[#00ff88] bg-black p-8 relative">
                    <div className="absolute top-3 left-3 w-3 h-3 bg-[#00ff88]"></div>
                    <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#00ff88]"></div>
                    <h3 className="text-2xl font-bold text-[#00ff88] mb-4 uppercase">
                      {t('overview.reason1.title')}
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {t('overview.reason1.description')}
                    </p>
                  </div>

                  <div className="border-2 border-[#ff0055] bg-black p-8 relative">
                    <div className="absolute top-3 left-3 w-3 h-3 bg-[#ff0055]"></div>
                    <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#ff0055]"></div>
                    <h3 className="text-2xl font-bold text-[#ff0055] mb-4 uppercase">
                      {t('overview.reason3.title')}
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {t('overview.reason3.description')}
                    </p>
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div className="border-2 border-gray-800 bg-black p-8">
                  <h3 className="text-xl font-bold text-[#00ff88] mb-6 uppercase flex items-center gap-3">
                    <div className="h-1 w-12 bg-[#00ff88]"></div>
                    {t('outcomes.label')}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 bg-[#00ff88] flex items-center justify-center text-base font-black text-black mt-0.5">
                          ✓
                        </div>
                        <p className="text-lg text-gray-300 leading-relaxed">
                          {t(`outcomes.items.item${num}`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Sign-up Form */}
              <div className="col-span-1 overflow-y-auto pr-4 custom-scrollbar" ref={formRef}>
                <div className="border-2 border-[#ff0055] bg-black p-8 relative sticky top-0 shadow-2xl shadow-[#ff0055]/20">
                  <div className="absolute top-3 left-3 w-3 h-3 bg-[#ff0055]"></div>
                  <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#ff0055]"></div>
                  <div className="absolute top-3 right-3 w-3 h-3 bg-[#00ff88]"></div>
                  <div className="absolute bottom-3 left-3 w-3 h-3 bg-[#00ff88]"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-[#ff0055]"></div>
                      <h2 className="text-base font-bold text-[#ff0055] uppercase tracking-wider">
                        {t('form.label')}
                      </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-white font-bold mb-2 uppercase text-sm">
                          {t('form.fullName')}
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          minLength={2}
                          placeholder={t('form.fullNamePlaceholder')}
                          className="w-full px-4 py-3 bg-[#0a0a0a] text-white text-base border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none transition-colors"
                          disabled={status === 'sending'}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-white font-bold mb-2 uppercase text-sm">
                          {t('form.email')}
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={t('form.emailPlaceholder')}
                          className="w-full px-4 py-3 bg-[#0a0a0a] text-white text-base border-2 border-gray-700 focus:border-[#00ff88] focus:outline-none transition-colors"
                          disabled={status === 'sending'}
                        />
                      </div>

                      {/* Free Access Info */}
                      <div className="border-2 border-[#00ff88] p-4 bg-[#00ff8810]">
                        <p className="text-sm text-[#00ff88] font-bold mb-2">
                          {t('form.freeAccess.title')}
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {t('form.freeAccess.description')}
                        </p>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="border-2 border-gray-700 p-4 bg-[#0a0a0a]">
                        <label className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            required
                            className="mt-1 w-5 h-5 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] focus:outline-none cursor-pointer flex-shrink-0"
                          />
                          <span className="text-sm text-gray-300 leading-relaxed">
                            {t('form.terms.label')}{' '}
                            <Link
                              href={`/${locale}/terms`}
                              className="text-[#00ff88] underline hover:text-[#00cfff] transition-colors"
                              target="_blank"
                            >
                              {t('form.terms.termsLink')}
                            </Link>
                            {' '}{t('form.terms.and')}{' '}
                            <Link
                              href={`/${locale}/privacy`}
                              className="text-[#00ff88] underline hover:text-[#00cfff] transition-colors"
                              target="_blank"
                            >
                              {t('form.terms.privacyLink')}
                            </Link>.
                          </span>
                        </label>
                      </div>

                      {/* Error Message */}
                      {status === 'error' && errorMessage && (
                        <div className="p-4 border-2 border-[#ff0055] bg-[#ff005510] text-[#ff0055] text-sm">
                          {errorMessage}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={status === 'sending' || !termsAccepted}
                        className="w-full px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-base"
                      >
                        {status === 'sending' ? t('form.sending') : t('form.submit')}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Success View
        <div className="relative z-10 h-full flex items-center justify-center p-8">
          <div className="max-w-3xl w-full border-2 border-[#00ff88] bg-black p-12 relative">
            <div className="absolute top-4 left-4 w-4 h-4 bg-[#00ff88]"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 bg-[#00ff88]"></div>
            <div className="absolute top-4 right-4 w-4 h-4 bg-[#ff0055]"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 bg-[#ff0055]"></div>

            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="inline-block p-6 bg-[#00ff88] text-black mb-6">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-[#00ff88] mb-6 uppercase">
                  {t('form.success.title')}
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  {t('form.success.message')}
                </p>

                <div className="inline-block px-8 py-4 bg-[#00ff8820] border-2 border-[#00ff88] mb-8">
                  <p className="text-2xl font-bold text-[#00ff88]">
                    {t('form.success.freeAccess')}
                  </p>
                </div>
              </div>

              <div className="text-left max-w-xl mx-auto border-t-2 border-gray-800 pt-8 mb-8">
                <p className="text-base text-gray-500 uppercase tracking-wider font-bold mb-6">
                  {t('form.success.nextSteps')}
                </p>
                <ul className="space-y-4 text-gray-300 text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-[#00ff88] mt-1 text-xl">1.</span>
                    <span>{t('form.success.step1')}</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[#00ff88] mt-1 text-xl">2.</span>
                    <span>{t('form.success.step2')}</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[#00ff88] mt-1 text-xl">3.</span>
                    <span>{t('form.success.step3')}</span>
                  </li>
                </ul>
              </div>

              <Link
                href={`/${locale}`}
                className="text-base text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-wide font-bold"
              >
                {t('backLink')}
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00ff88;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00cfff;
        }
      `}</style>
    </div>
  );
}
