'use client';

import { useTranslations } from "next-intl";

export default function Speaking() {
  const t = useTranslations('speaking');

  return (
    <section id="speaking" className="section-pad relative overflow-hidden" style={{ background: '#0a0a0a' }} aria-labelledby="speaking-heading">
      <div className="section-container">
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-1 w-12 bg-[#11b981]" aria-hidden="true"></div>
            <span className="section-kicker">{t('label')}</span>
          </div>

          <h2 id="speaking-heading" className="section-title mb-2 text-white leading-tight">
            {t('title1')}
            <br />
            <span className="text-[#11b981]">{t('title2')}</span>
          </h2>

          <p className="text-base text-[#d1d5db] max-w-3xl">
            {t('description')}
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-6 mb-4">
          <span className="text-sm uppercase tracking-widest text-[#9ca3af]">
            {t('conferences.title')}
          </span>
          <div className="flex flex-wrap items-center gap-4 text-base text-white font-semibold">
            {[0, 1, 2].map((i) => (
              <span key={i} className="text-[#d1d5db]">
                {t(`conferences.events.${i}`)}
              </span>
            ))}
            <span className="text-sm text-[#9ca3af]">+{t('conferences.more')}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="px-3 py-1 text-sm uppercase tracking-wider border border-white/10 text-[#e5e7eb] rounded-full bg-white/[0.02]">
              {t(`formats.${i}`)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
