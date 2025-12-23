'use client';

import { useTranslations } from "next-intl";

export default function Speaking() {
  const t = useTranslations('speaking');

  return (
    <section id="speaking" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#0a0a0a' }} aria-labelledby="speaking-heading">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-1 w-12 bg-[#10b981]" aria-hidden="true"></div>
            <span className="text-[#10b981] font-bold uppercase tracking-wider text-sm sm:text-base">{t('label')}</span>
          </div>

          <h2 id="speaking-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            {t('title1')}
            <br />
            <span className="text-[#10b981]">{t('title2')}</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-[#d1d5db] leading-relaxed max-w-3xl">
            {t('description')}
          </p>
        </header>

        {/* Featured Conferences & Education with template styling */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Conferences */}
          <section className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-8" aria-labelledby="conferences-heading">
            <h3 id="conferences-heading" className="text-xl sm:text-2xl font-bold text-white mb-6 uppercase">
              {t('conferences.title')}
            </h3>
            <ul className="space-y-3 list-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-3 text-[#d1d5db]">
                  <span className="text-[#10b981] text-xl" aria-hidden="true">▸</span>
                  <span className="font-bold text-sm sm:text-base">{t(`conferences.events.${i}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Education */}
          <section className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-8" aria-labelledby="education-heading">
            <h3 id="education-heading" className="text-xl sm:text-2xl font-bold text-white mb-6 uppercase">
              {t('education.title')}
            </h3>
            <div className="flex items-start gap-4">
              <span className="text-4xl" aria-hidden="true">🎓</span>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#10b981] mb-2">
                  {t('education.platzi')}
                </p>
                <p className="text-sm sm:text-base text-[#d1d5db]">
                  {t('education.description')}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
