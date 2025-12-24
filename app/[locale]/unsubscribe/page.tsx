'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Unsubscribe() {
  const t = useTranslations('unsubscribe');
  const locale = useLocale() as 'en' | 'es';
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'sending' | 'success' | 'updated' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>(locale);

  // Subscription preferences
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [subscribePodcast, setSubscribePodcast] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [userLanguage, setUserLanguage] = useState<'en' | 'es' | null>(null); // User's stored language preference

  // Auto-populate email from URL parameter if provided (for email links)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      // Decode and sanitize email
      const decodedEmail = decodeURIComponent(emailParam);
      // Basic email validation
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedEmail)) {
        setEmail(decodedEmail);
        // Auto-load preferences if email is in URL
        loadPreferences(decodedEmail);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadPreferences = async (emailAddress: string) => {
    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailAddress.trim().toLowerCase(),
          action: 'get_preferences'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribeNewsletter(data.subscribe_newsletter || false);
        setSubscribePodcast(data.subscribe_podcast || false);
        // Store the user's language preference from database to determine which options to show
        // n8n returns 'lang' field, not 'language'
        setUserLanguage(data.lang || data.language || 'en');
        setShowPreferences(true);
        setStatus('loaded');
      } else if (response.status === 404) {
        // User not found
        setErrorMessage(
          language === 'es'
            ? 'Este email no está en nuestra lista. ¿Quizás ya te has desuscrito?'
            : "This email is not in our list. Perhaps you've already unsubscribed?"
        );
        setStatus('error');
      } else {
        setErrorMessage(
          language === 'es'
            ? 'Error al cargar tus preferencias. Intenta de nuevo.'
            : 'Error loading your preferences. Please try again.'
        );
        setStatus('error');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setStatus('idle');
    }
  };

  const handleLoadPreferences = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(language === 'es' ? 'Email inválido' : 'Invalid email');
      setStatus('error');
      return;
    }

    await loadPreferences(email);
  };

  const handleUpdatePreferences = async () => {
    setStatus('sending');
    setErrorMessage('');

    // Check if unsubscribing from all
    const unsubscribeAll = !subscribeNewsletter && !subscribePodcast;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          language: language, // Send current page language to update email preference
          action: unsubscribeAll ? 'unsubscribe' : 'update_preferences',
          preferences: {
            newsletter: subscribeNewsletter,
            podcast: subscribePodcast
          }
        }),
      });

      if (response.ok) {
        // Differentiate between unsubscribe and update
        setStatus(unsubscribeAll ? 'success' : 'updated');
      } else if (response.status === 404) {
        setErrorMessage(
          language === 'es'
            ? 'Este email no está en nuestra lista'
            : 'This email is not in our list'
        );
        setStatus('error');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || (language === 'es' ? 'Error al actualizar' : 'Update failed'));
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage(language === 'es' ? 'Error al actualizar' : 'Update failed');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-2xl">
        {/* Main Card - Template styling */}
        <div className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          <div className="relative z-10">
            {status === 'success' || status === 'updated' ? (
              // Success state
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {status === 'updated'
                      ? t('success.preferencesUpdatedTitle')
                      : t('success.title')}
                  </h1>
                  <p className="text-lg text-[#d1d5db] leading-relaxed max-w-xl mx-auto">
                    {status === 'updated'
                      ? t('success.preferencesUpdatedMessage')
                      : t('success.message')}
                  </p>
                </div>

                <div className="border-t border-[#1f2937] pt-8">
                  <p className="text-sm text-[#9ca3af] mb-4">
                    {status === 'updated'
                      ? t('success.preferencesUpdatedFeedback')
                      : t('success.feedback')}
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-8 py-3 bg-[#10b981] text-black font-black uppercase tracking-wide rounded hover:bg-[#059669] transition-colors"
                  >
                    {t('success.backHome')}
                  </Link>
                </div>
              </div>
            ) : !showPreferences ? (
              // Email entry form
              <>
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-1 w-12 bg-[#10b981]"></div>
                    <span className="text-[#10b981] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {t('manageTitle')}
                  </h1>

                  <p className="text-base text-[#d1d5db] leading-relaxed max-w-xl">
                    {t('manageDescription')}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLoadPreferences} className="space-y-6">
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
                      className="w-full px-4 py-3 bg-[#0a0a0a] text-white border border-[#1f2937] rounded focus:border-[#10b981] focus:outline-none transition-colors"
                      disabled={status === 'loading'}
                    />
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <div className="p-4 border border-[#ef4444] border-l-[3px] border-l-[#ef4444] rounded bg-[#ef4444]/10 text-[#ef4444]">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-8 py-4 bg-[#10b981] text-black font-black uppercase tracking-wide rounded hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {status === 'loading' ? t('form.loading') : t('form.continue')}
                  </button>
                </form>

                {/* Additional info */}
                <div className="border-t border-[#1f2937] pt-8 mt-8">
                  <p className="text-sm text-[#9ca3af]">
                    {t('additionalInfo')}
                  </p>
                </div>
              </>
            ) : (
              // Preferences management
              <>
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-1 w-12 bg-[#10b981]"></div>
                    <span className="text-[#10b981] font-bold uppercase tracking-wider text-sm">
                      {t('preferencesLabel')}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {t('preferencesTitle')}
                  </h1>

                  <p className="text-base text-[#d1d5db] leading-relaxed max-w-xl mb-4">
                    {t('preferencesDescription')}
                  </p>

                  <p className="text-sm text-[#9ca3af]">
                    {email}
                  </p>
                </div>

                {/* Subscription Preferences */}
                <div className="space-y-6 mb-8">
                  <div className="space-y-3 border border-[#1f2937] rounded p-4 bg-[#0a0a0a]">
                    {/* Newsletter / AI News */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={subscribeNewsletter}
                        onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                        className="mt-1 w-5 h-5 bg-black border border-[#1f2937] checked:bg-[#10b981] checked:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-black cursor-pointer rounded"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold text-sm block mb-1">
                          🤖 {t('preferences.newsletter.title')}
                        </span>
                        <span className="text-[#9ca3af] text-xs">
                          {t('preferences.newsletter.description')}
                        </span>
                      </div>
                    </label>

                    {/* Podcast - Show if page language is Spanish, user's language is Spanish, or if they're subscribed to it */}
                    {(language === 'es' || userLanguage === 'es' || subscribePodcast) && (
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={subscribePodcast}
                          onChange={(e) => setSubscribePodcast(e.target.checked)}
                          className="mt-1 w-5 h-5 bg-black border border-[#1f2937] checked:bg-[#10b981] checked:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-black cursor-pointer rounded"
                        />
                        <div className="flex-1">
                          <span className="text-white font-semibold text-sm block mb-1">
                            🎙️ {t('preferences.podcast.title')}
                          </span>
                          <span className="text-[#9ca3af] text-xs">
                            {t('preferences.podcast.description')}
                          </span>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <div className="p-4 border border-[#ef4444] border-l-[3px] border-l-[#ef4444] rounded bg-[#ef4444]/10 text-[#ef4444]">
                      {errorMessage}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleUpdatePreferences}
                      disabled={status === 'sending'}
                      className="w-full px-8 py-4 bg-[#10b981] text-black font-black uppercase tracking-wide rounded hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {status === 'sending' ? t('form.saving') : t('form.saveChanges')}
                    </button>

                    {!subscribeNewsletter && !subscribePodcast && (
                      <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444] rounded text-center">
                        <p className="text-[#ef4444] text-sm font-semibold">
                          {t('warningUnsubscribeAll')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional info */}
                <div className="border-t border-[#1f2937] pt-8 mt-8">
                  <p className="text-sm text-[#9ca3af]">
                    {t('tip')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[#9ca3af] hover:text-[#10b981] transition-colors uppercase tracking-wide font-bold"
          >
            {t('backLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}