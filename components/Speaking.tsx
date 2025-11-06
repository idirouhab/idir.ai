'use client';

import { useTranslations } from "next-intl";

export default function Speaking() {
  const t = useTranslations('speaking');

  return (
    <section id="speaking" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-1 w-12 bg-[#00cfff]"></div>
            <span className="text-[#00cfff] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            {t('title1')}
            <br />
            <span className="text-[#00cfff]">{t('title2')}</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl">
            {t('description')}
          </p>
        </div>

        {/* Featured Conferences & Education */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Conferences */}
          <div className="bg-black border-2 border-[#ff0055] p-8">
            <h3 className="text-2xl font-black text-white mb-6 uppercase">
              {t('conferences.title')}
            </h3>
            <ul className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-[#ff0055] text-xl">▸</span>
                  <span className="font-bold">{t(`conferences.events.${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div className="bg-black border-2 border-[#00ff88] p-8">
            <h3 className="text-2xl font-black text-white mb-6 uppercase">
              {t('education.title')}
            </h3>
            <div className="flex items-start gap-4">
              <span className="text-4xl">🎓</span>
              <div>
                <p className="text-xl font-bold text-[#00ff88] mb-2">
                  {t('education.platzi')}
                </p>
                <p className="text-gray-300">
                  {t('education.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
