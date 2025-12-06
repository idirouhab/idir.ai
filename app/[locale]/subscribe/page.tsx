'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trackNewsletterSubmit } from '@/lib/analytics';
import Link from 'next/link';

export default function Subscribe() {
  const t = useTranslations('subscribe');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [consent, setConsent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Subscription preferences
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [subscribePodcast, setSubscribePodcast] = useState(false);

  const handleAcceptConsent = () => {
    setConsent(true);
    setShowModal(false);
  };

  const handleCancelConsent = () => {
    setConsent(false);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one subscription is selected
    if (!subscribeNewsletter && !subscribePodcast) {
      setStatus('error');
      return;
    }

    setStatus('sending');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          language,
          action: 'subscribe',
          preferences: {
            newsletter: subscribeNewsletter,
            podcast: subscribePodcast
          }
        }),
      });

      if (response.ok) {
        setStatus('success');
        trackNewsletterSubmit(email, language, 'subscribe_page');
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

              <p className="text-base text-gray-300 leading-relaxed max-w-2xl">
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
                        : 'bg-[#0a0a0a] text-gray-300 border-gray-700 hover:border-gray-600'
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
                        : 'bg-[#0a0a0a] text-gray-300 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {t('form.languageEs')}
                  </button>
                </div>
              </div>

              {/* Subscription Preferences */}
              <div>
                <label className="block text-white font-bold mb-3 uppercase text-sm">
                  {language === 'es' ? 'Suscribirme a' : 'Subscribe to'}
                </label>
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
                        🤖 {language === 'es' ? 'Noticias IA Diarias' : 'Daily AI News'}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {language === 'es'
                          ? 'Las mejores noticias de IA cada día, directo al punto'
                          : 'The best AI news every day, straight to the point'}
                      </span>
                    </div>
                  </label>

                  {/* Podcast - Spanish only */}
                  {language === 'es' && (
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={subscribePodcast}
                        onChange={(e) => setSubscribePodcast(e.target.checked)}
                        className="mt-1 w-5 h-5 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold text-sm block mb-1">
                          🎙️ Nuevos Episodios del Podcast
                        </span>
                        <span className="text-gray-400 text-xs">
                          Notificación cuando publico un nuevo episodio del podcast
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="border-2 border-gray-800 p-4 bg-[#0a0a0a]">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShowModal(true);
                        e.preventDefault();
                      } else {
                        setConsent(false);
                      }
                    }}
                    required
                    className="mt-1 w-5 h-5 bg-black border-2 border-gray-700 checked:bg-[#00ff88] checked:border-[#00ff88] focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
                  />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    {t('form.consentShort')}{' '}
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="text-[#00ff88] underline hover:text-[#00cfff] transition-colors"
                    >
                      {t('form.consentLink')}
                    </button>
                  </span>
                </label>
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="p-4 border-2 border-[#00ff88] bg-[#00ff8810] text-[#00ff88]">
                  {t('form.success')}
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 border-2 border-[#ff0055] bg-[#ff005510] text-[#ff0055]">
                  {!subscribeNewsletter && !subscribePodcast
                    ? (language === 'es'
                      ? 'Por favor, selecciona al menos una opción de suscripción'
                      : 'Please select at least one subscription option')
                    : t('form.error')}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending' || !consent}
                className="w-full px-8 py-4 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {status === 'sending' ? t('form.sending') : t('form.submit')}
              </button>
            </form>

            {/* What you'll get */}
            <div className="border-t-2 border-gray-800 pt-8">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-4">{t('whatYouGet')}</p>
              <ul className="space-y-3 text-gray-300 text-sm">
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
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-wide font-bold"
          >
            {t('backLink')}
          </Link>
        </div>
      </div>

      {/* Privacy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-black border-2 border-[#00ff88] max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            {/* Corner markers */}
            <div className="absolute top-3 left-3 w-4 h-4 bg-[#00ff88]"></div>
            <div className="absolute top-3 right-3 w-4 h-4 bg-[#ff0055]"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-[#ff0055]"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 bg-[#00ff88]"></div>

            <div className="p-8 relative z-10">
              {/* Header */}
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 uppercase">
                {t('modal.title')}
              </h2>

              {/* Content */}
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed mb-8">
                <p className="text-base font-bold text-white">
                  {t('modal.intro')}
                </p>

                <div className="border-l-3 border-[#00ff88] pl-4 bg-[#0a0a0a] p-4">
                  <h3 className="text-[#00ff88] font-bold mb-2 uppercase text-xs tracking-wider">
                    {t('modal.section1.title')}
                  </h3>
                  <p>{t('modal.section1.content')}</p>
                </div>

                <div className="border-l-3 border-[#00cfff] pl-4 bg-[#0a0a0a] p-4">
                  <h3 className="text-[#00cfff] font-bold mb-2 uppercase text-xs tracking-wider">
                    {t('modal.section2.title')}
                  </h3>
                  <p>{t('modal.section2.content')}</p>
                </div>

                <div className="border-l-3 border-[#ff0055] pl-4 bg-[#0a0a0a] p-4">
                  <h3 className="text-[#ff0055] font-bold mb-2 uppercase text-xs tracking-wider">
                    {t('modal.section3.title')}
                  </h3>
                  <p>{t('modal.section3.content')}</p>
                </div>

                <p className="text-xs text-gray-500 italic pt-4">
                  {t('modal.footer')}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptConsent}
                  className="flex-1 px-6 py-3 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
                >
                  {t('modal.accept')}
                </button>
                <button
                  onClick={handleCancelConsent}
                  className="flex-1 px-6 py-3 border-2 border-gray-700 text-gray-300 font-bold uppercase tracking-wide hover:border-[#ff0055] hover:text-[#ff0055] transition-colors"
                >
                  {t('modal.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
