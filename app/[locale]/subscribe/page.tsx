'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { trackNewsletterSubmit } from '@/lib/analytics';
import Link from 'next/link';

export default function Subscribe() {
  const t = useTranslations('subscribe');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>((locale === 'es' ? 'es' : 'en'));
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-3xl">
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
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-1 w-12 bg-[#10b981]"></div>
                <span className="text-[#10b981] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                {t('title1')}
                <br />
                <span className="text-[#10b981]">{t('title2')}</span>
              </h1>

              <p className="text-base text-[#d1d5db] leading-relaxed max-w-2xl">
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
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border border-[#1f2937] rounded focus:border-[#10b981] focus:outline-none transition-colors"
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
                    className={`px-4 py-3 border font-bold uppercase text-sm transition-all rounded ${
                      language === 'en'
                        ? 'bg-[#10b981] text-black border-[#10b981]'
                        : 'bg-[#0a0a0a] text-[#d1d5db] border-[#1f2937] hover:border-[#10b981]'
                    }`}
                  >
                    {t('form.languageEn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('es')}
                    className={`px-4 py-3 border font-bold uppercase text-sm transition-all rounded ${
                      language === 'es'
                        ? 'bg-[#10b981] text-black border-[#10b981]'
                        : 'bg-[#0a0a0a] text-[#d1d5db] border-[#1f2937] hover:border-[#10b981]'
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
                        🤖 {language === 'es' ? 'Noticias IA Diarias' : 'Daily AI News'}
                      </span>
                      <span className="text-[#9ca3af] text-xs">
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
                        className="mt-1 w-5 h-5 bg-black border border-[#1f2937] checked:bg-[#10b981] checked:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-black cursor-pointer rounded"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold text-sm block mb-1">
                          🎙️ Nuevos Episodios del Podcast
                        </span>
                        <span className="text-[#9ca3af] text-xs">
                          Notificación cuando publico un nuevo episodio del podcast
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="border border-[#1f2937] rounded p-4 bg-[#0a0a0a]">
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
                    className="mt-1 w-5 h-5 bg-black border border-[#1f2937] checked:bg-[#10b981] checked:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-black cursor-pointer rounded"
                  />
                  <span className="text-sm text-[#d1d5db] leading-relaxed">
                    {language === 'es' ? 'Acepto la ' : 'I accept the '}
                    <Link
                      href={`/${locale}/privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#10b981] underline hover:text-[#059669] transition-colors"
                    >
                      {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
                    </Link>
                    {language === 'es' ? ' y los ' : ' and '}
                    <Link
                      href={`/${locale}/terms`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#10b981] underline hover:text-[#059669] transition-colors"
                    >
                      {language === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions'}
                    </Link>
                    {'. '}
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="text-[#10b981] underline hover:text-[#059669] transition-colors"
                    >
                      {language === 'es' ? 'Leer más' : 'Read more'}
                    </button>
                  </span>
                </label>
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="p-4 border border-[#10b981] border-l-[3px] border-l-[#10b981] rounded bg-[#10b981]/10 text-[#10b981]">
                  {t('form.success')}
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 border border-[#ef4444] border-l-[3px] border-l-[#ef4444] rounded bg-[#ef4444]/10 text-[#ef4444]">
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
                className="w-full px-8 py-4 bg-[#10b981] text-black font-black uppercase tracking-wide rounded hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {status === 'sending' ? t('form.sending') : t('form.submit')}
              </button>
            </form>

            {/* What you'll get */}
            <div className="border-t border-[#1f2937] pt-8">
              <p className="text-sm text-[#9ca3af] uppercase tracking-wider font-bold mb-4">{t('whatYouGet')}</p>
              <ul className="space-y-3 text-[#d1d5db] text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] mt-1">→</span>
                  <span>{t('benefits.daily')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] mt-1">→</span>
                  <span>{t('benefits.language')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] mt-1">→</span>
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
            className="text-sm text-[#9ca3af] hover:text-[#10b981] transition-colors uppercase tracking-wide font-bold"
          >
            {t('backLink')}
          </Link>
        </div>
      </div>

      {/* Privacy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 rounded-lg" aria-hidden="true">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            <div className="p-8 relative z-10">
              {/* Header */}
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 uppercase">
                {t('modal.title')}
              </h2>

              {/* Content */}
              <div className="space-y-4 text-[#d1d5db] text-sm leading-relaxed mb-8">
                <p className="text-base font-bold text-white">
                  {t('modal.intro')}
                </p>

                <div className="border-l-[3px] border-[#10b981] pl-4 bg-[#0a0a0a] p-4 rounded">
                  <h3 className="text-[#10b981] font-bold mb-2 uppercase text-xs tracking-wider">
                    {t('modal.section1.title')}
                  </h3>
                  <p>{t('modal.section1.content')}</p>
                </div>

                <div className="border-l-[3px] border-[#10b981] pl-4 bg-[#0a0a0a] p-4 rounded">
                  <h3 className="text-[#10b981] font-bold mb-2 uppercase text-xs tracking-wider">
                    {t('modal.section2.title')}
                  </h3>
                  <p>{t('modal.section2.content')}</p>
                </div>

                <div className="border-l-[3px] border-[#10b981] pl-4 bg-[#0a0a0a] p-4 rounded">
                  <h3 className="text-[#10b981] font-bold mb-2 uppercase text-xs tracking-wider">
                    {t('modal.section3.title')}
                  </h3>
                  <p>{t('modal.section3.content')}</p>
                </div>

                <p className="text-xs text-[#9ca3af] italic pt-4">
                  {t('modal.footer')}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptConsent}
                  className="flex-1 px-6 py-3 bg-[#10b981] text-black font-black uppercase tracking-wide rounded hover:bg-[#059669] transition-colors"
                >
                  {t('modal.accept')}
                </button>
                <button
                  onClick={handleCancelConsent}
                  className="flex-1 px-6 py-3 border border-[#1f2937] text-[#d1d5db] font-bold uppercase tracking-wide rounded hover:border-[#10b981] hover:text-[#10b981] transition-colors"
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
