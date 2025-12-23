'use client';

import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations('about');

  const expertise = [
    {
      title: t('expertise.automation.title'),
      description: t('expertise.automation.description'),
      icon: "⚡",
      color: "#10b981",
    },
    {
      title: t('expertise.ai.title'),
      description: t('expertise.ai.description'),
      icon: "🤖",
      color: "#10b981",
    },
    {
      title: t('expertise.architecture.title'),
      description: t('expertise.architecture.description'),
      icon: "🏗️",
      color: "#10b981",
    },
    {
      title: t('expertise.speaking.title'),
      description: t('expertise.speaking.description'),
      icon: "🎤",
      color: "#10b981",
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#0a0a0a' }} aria-labelledby="about-heading">
      {/* Background pattern - decorative */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with line accent */}
        <header className="mb-16">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-1 w-16 bg-[#10b981]" aria-hidden="true"></div>
            <span className="text-[#10b981] font-bold uppercase tracking-wider text-sm sm:text-base">{t('label')}</span>
          </div>

          <h2 id="about-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            {t('title1')}
            <br />
            <span className="gradient-text">{t('title2')}</span>
          </h2>

          {/* Personal intro - first person */}
          <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed max-w-4xl mb-4 font-bold">
            {t('personalIntro')}
          </p>

          <p className="text-base sm:text-lg md:text-xl text-[#d1d5db] leading-relaxed max-w-3xl mb-8">
            {t('intro')}
          </p>

          {/* By the Numbers - Proof Section with template styling */}
          <aside className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-6 sm:p-8 mb-8" aria-label="Professional achievements">
            <h3 className="text-xl sm:text-2xl font-bold text-[#10b981] mb-6 uppercase tracking-wide">
              {t('proofTitle')}
            </h3>
            <ul className="grid sm:grid-cols-2 gap-4 list-none">
              <li className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">🎤</span>
                <p className="text-sm sm:text-base text-[#d1d5db]">{t('proofConferences')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">🎓</span>
                <p className="text-sm sm:text-base text-[#d1d5db]">{t('proofStudents')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">🎙️</span>
                <p className="text-sm sm:text-base text-[#d1d5db]">{t('proofPodcast')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">⚡</span>
                <p className="text-sm sm:text-base text-[#d1d5db]">{t('proofWorkflows')}</p>
              </li>
            </ul>
          </aside>
        </header>

        {/* Expertise Grid - Template card styling */}
        <section aria-label="Areas of expertise">
          <div className="grid md:grid-cols-2 gap-6 mb-16" role="list">
            {expertise.map((item, index) => (
              <article
                key={index}
                className="p-8 bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg transition-all duration-300"
                role="listitem"
              >
                <div className="text-4xl mb-4" aria-hidden="true">{item.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#10b981] mb-4 uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-[#d1d5db] leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Mission Statement - Template card styling */}
        <section className="relative" aria-labelledby="mission-heading">
          <div className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-6 sm:p-8">
            <h3 id="mission-heading" className="text-xl sm:text-2xl font-bold text-white mb-4 uppercase">
              {t('mission.title')}
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-[#d1d5db] leading-relaxed mb-4">
              {t('mission.description')}
            </p>
            <ul className="flex flex-wrap gap-3 list-none" role="list" aria-label="Mission focus areas">
              <li className="px-4 py-2 border border-[#10b981] text-[#10b981] font-bold text-sm rounded">
                <span aria-hidden="true">→ </span>
                {t('mission.focus1')}
              </li>
              <li className="px-4 py-2 border border-[#10b981] text-[#10b981] font-bold text-sm rounded">
                <span aria-hidden="true">→ </span>
                {t('mission.focus2')}
              </li>
              <li className="px-4 py-2 border border-[#10b981] text-[#10b981] font-bold text-sm rounded">
                <span aria-hidden="true">→ </span>
                {t('mission.focus3')}
              </li>
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}
