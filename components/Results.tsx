'use client';

import { useTranslations } from 'next-intl';

export default function Results() {
  const t = useTranslations('results');

  const stats = [
    { value: t('stats.0.value'), label: t('stats.0.label') },
    { value: t('stats.1.value'), label: t('stats.1.label') },
    { value: t('stats.2.value'), label: t('stats.2.label') },
  ];

  const quotes = [
    { quote: t('testimonials.0.quote'), name: t('testimonials.0.name'), role: t('testimonials.0.role') },
    { quote: t('testimonials.1.quote'), name: t('testimonials.1.name'), role: t('testimonials.1.role') },
  ];

  return (
    <section id="results" className="section-pad bg-black" aria-labelledby="results-heading">
      <div className="section-container">
        <header className="mb-10 md:mb-14">
          <h2 id="results-heading" className="section-title mb-4 text-white">
            {t('title')}
          </h2>
          <p className="section-subtitle max-w-3xl">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {stats.slice(0, 2).map((stat, idx) => (
            <div key={idx} className="card-surface">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-sm text-[#9ca3af] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {quotes.slice(0, 2).map((q, idx) => (
            <figure key={idx} className="card-surface">
              <blockquote className="text-base md:text-lg text-[#e5e7eb] leading-relaxed mb-4">
                “{q.quote}”
              </blockquote>
              <figcaption className="text-sm text-[#9ca3af]">
                <span className="text-white font-semibold">{q.name}</span> · {q.role}
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}
