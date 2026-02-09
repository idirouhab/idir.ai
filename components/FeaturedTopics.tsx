'use client';

import { useTranslations } from 'next-intl';

export default function FeaturedTopics() {
  const t = useTranslations('topics');

  const items = [
    t('items.0'),
    t('items.1'),
    t('items.2'),
    t('items.3'),
    t('items.4'),
    t('items.5'),
  ];

  return (
    <section id="topics" className="section-pad bg-black" aria-labelledby="topics-heading">
      <div className="section-container">
        <header className="mb-8">
          <h2 id="topics-heading" className="section-title text-2xl sm:text-3xl md:text-4xl mb-3 text-white">
            {t('title')}
          </h2>
          <p className="section-subtitle text-sm md:text-base max-w-3xl">
            {t('subtitle')}
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 text-xs md:text-sm uppercase tracking-wider border border-white/10 text-[#e5e7eb] rounded-full bg-white/[0.02]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
