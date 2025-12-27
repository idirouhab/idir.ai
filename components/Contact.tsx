'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackContactSubmit, trackSocialLink } from "@/lib/analytics";

export default function Contact() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        trackContactSubmit('contact_form');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const socialLinks = [
    {
      name: t('platforms.linkedin'),
      href: "https://www.linkedin.com/in/idirouhab/",
      icon: "svg",
      svg: <svg viewBox="0 0 382 382" fill="currentColor" className="w-16 h-16">
        <path d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472L341.91,330.654L341.91,330.654z"/>
      </svg>,
      color: "#10b981"
    },
    {
      name: t('platforms.x'),
      href: "https://x.com/idir_ouhab",
      icon: "svg",
      svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>,
      color: "#10b981"
    },
    {
      name: t('platforms.instagram'),
      href: "https://www.instagram.com/promptnplay/",
      icon: "svg",
      svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"/>
        <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"/>
      </svg>,
      color: "#10b981"
    },
    {
      name: t('platforms.github'),
      href: "https://www.github.com/idirouhab",
      icon: "svg",
      svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>,
      color: "#10b981"
    },
  ];

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0a' }} aria-labelledby="contact-heading">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h2 id="contact-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title1')} <span className="text-[#10b981]">{t('title2')}</span>
          </h2>

          <p className="text-base md:text-lg text-[#d1d5db]">
            {t('description')}
          </p>
        </header>

        <div className="mb-12">
          {/* Contact Form */}
          <div className="bg-[#111827] rounded-lg p-6 sm:p-8"  aria-labelledby="contact-form-heading">

            {status === 'success' && (
              <div className="mb-6 p-4 bg-[#10b981]/10 text-[#10b981] rounded" role="alert" aria-live="polite">
                {t('form.success')}
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-[#ef4444]/10 text-[#ef4444] rounded" role="alert" aria-live="assertive">
                {t('form.error')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="contact-form-heading">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2 text-sm">
                  {t('form.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t('form.namePlaceholder')}
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border border-[#1f2937] rounded focus:border-[#10b981] focus:outline-none transition-colors"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2 text-sm">
                  {t('form.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={t('form.emailPlaceholder')}
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border border-[#1f2937] rounded focus:border-[#10b981] focus:outline-none transition-colors"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-medium mb-2 text-sm">
                  {t('form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder={t('form.messagePlaceholder')}
                  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border border-[#1f2937] rounded focus:border-[#10b981] focus:outline-none transition-colors resize-none"
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full px-6 py-3 bg-[#10b981] text-black font-bold rounded hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={status === 'sending'}
              >
                {status === 'sending' ? t('form.sending') : t('form.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
