'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

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
            {status === 'success' || status === 'updated' ? (
              // Success state
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {status === 'updated'
                      ? (language === 'es' ? 'Preferencias Actualizadas' : 'Preferences Updated')
                      : t('success.title')}
                  </h1>
                  <p className="text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
                    {status === 'updated'
                      ? (language === 'es'
                          ? 'Tus preferencias de suscripción han sido actualizadas correctamente.'
                          : 'Your subscription preferences have been updated successfully.')
                      : t('success.message')}
                  </p>
                </div>

                <div className="border-t-2 border-gray-800 pt-8">
                  <p className="text-sm text-gray-500 mb-4">
                    {status === 'updated'
                      ? (language === 'es'
                          ? 'Puedes cerrar esta ventana o volver a la página principal.'
                          : 'You can close this window or return to the main page.')
                      : t('success.feedback')}
                  </p>
                  <a
                    href="/"
                    className="inline-block px-8 py-3 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
                  >
                    {t('success.backHome')}
                  </a>
                </div>
              </div>
            ) : !showPreferences ? (
              // Email entry form
              <>
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-1 w-12 bg-[#ff0055]"></div>
                    <span className="text-[#ff0055] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
                    <div className="h-1 flex-1 bg-[#ff0055]"></div>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {language === 'es' ? 'Gestiona tus Suscripciones' : 'Manage Your Subscriptions'}
                  </h1>

                  <p className="text-base text-gray-300 leading-relaxed max-w-xl">
                    {language === 'es'
                      ? 'Puedes desuscribirte de todas las listas o solo de algunas. Tú eliges.'
                      : 'You can unsubscribe from all lists or just some. Your choice.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLoadPreferences} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-white font-bold mb-2 uppercase text-sm">
                      {language === 'es' ? 'Email' : 'Email'}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                      className="w-full px-4 py-3 bg-[#0a0a0a] text-white border-2 border-gray-700 focus:border-[#ff0055] focus:outline-none transition-colors"
                      disabled={status === 'loading'}
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
                    disabled={status === 'loading'}
                    className="w-full px-8 py-4 bg-[#ff0055] text-white font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {status === 'loading'
                      ? (language === 'es' ? 'Cargando...' : 'Loading...')
                      : (language === 'es' ? 'Continuar' : 'Continue')}
                  </button>
                </form>

                {/* Additional info */}
                <div className="border-t-2 border-gray-800 pt-8 mt-8">
                  <p className="text-sm text-gray-500">
                    {language === 'es'
                      ? 'También puedes desuscribirte desde cualquier email que te enviemos.'
                      : 'You can also unsubscribe from any email we send you.'}
                  </p>
                </div>
              </>
            ) : (
              // Preferences management
              <>
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-1 w-12 bg-[#ff0055]"></div>
                    <span className="text-[#ff0055] font-bold uppercase tracking-wider text-sm">
                      {language === 'es' ? 'Preferencias' : 'Preferences'}
                    </span>
                    <div className="h-1 flex-1 bg-[#ff0055]"></div>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                    {language === 'es' ? 'Elige lo que Quieres' : 'Choose What You Want'}
                  </h1>

                  <p className="text-base text-gray-300 leading-relaxed max-w-xl mb-4">
                    {language === 'es'
                      ? 'Desmarca las opciones de las que quieres desuscribirte, o desmarca todas para salir completamente.'
                      : 'Uncheck the options you want to unsubscribe from, or uncheck all to opt out completely.'}
                  </p>

                  <p className="text-sm text-gray-500">
                    {email}
                  </p>
                </div>

                {/* Subscription Preferences */}
                <div className="space-y-6 mb-8">
                  <div className="space-y-3 border-2 border-gray-800 p-4 bg-[#0a0a0a]">
                    {/* Newsletter / AI News */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={subscribeNewsletter}
                        onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                        className="mt-1 w-5 h-5 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold text-sm block mb-1">
                          🤖 {t('preferences.newsletter.title')}
                        </span>
                        <span className="text-gray-400 text-xs">
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
                          className="mt-1 w-5 h-5 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-white font-semibold text-sm block mb-1">
                            🎙️ {t('preferences.podcast.title')}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {t('preferences.podcast.description')}
                          </span>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <div className="p-4 border-2 border-[#ff0055] bg-[#ff005510] text-[#ff0055]">
                      {errorMessage}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleUpdatePreferences}
                      disabled={status === 'sending'}
                      className="w-full px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {status === 'sending'
                        ? (language === 'es' ? 'Guardando...' : 'Saving...')
                        : (language === 'es' ? 'Guardar Cambios' : 'Save Changes')}
                    </button>

                    {!subscribeNewsletter && !subscribePodcast && (
                      <div className="p-3 bg-[#ff005510] border border-[#ff0055] text-center">
                        <p className="text-[#ff0055] text-sm font-semibold">
                          {language === 'es'
                            ? '⚠️ Esto te desuscribirá de todo'
                            : '⚠️ This will unsubscribe you from everything'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional info */}
                <div className="border-t-2 border-gray-800 pt-8 mt-8">
                  <p className="text-sm text-gray-500">
                    {language === 'es'
                      ? '💡 Consejo: Puedes mantener solo las suscripciones que te interesen'
                      : '💡 Tip: You can keep only the subscriptions you\'re interested in'}
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