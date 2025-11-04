'use client';

import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations('about');

  const expertise = [
    {
      title: t('expertise.automation.title'),
      description: t('expertise.automation.description'),
      icon: "⚡",
      color: "#00ff88",
    },
    {
      title: t('expertise.ai.title'),
      description: t('expertise.ai.description'),
      icon: "🤖",
      color: "#00cfff",
    },
    {
      title: t('expertise.architecture.title'),
      description: t('expertise.architecture.description'),
      icon: "🏗️",
      color: "#ff0055",
    },
    {
      title: t('expertise.speaking.title'),
      description: t('expertise.speaking.description'),
      icon: "🎤",
      color: "#00ff88",
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #00ff88 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with line accent */}
        <div className="mb-16">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-1 w-16 bg-[#00ff88]"></div>
            <span className="text-[#00ff88] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            {t('title1')}
            <br />
            <span className="gradient-text">{t('title2')}</span>
          </h2>

          {/* Personal intro - first person */}
          <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed max-w-4xl mb-4 font-bold">
            {t('personalIntro')}
          </p>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mb-8">
            {t('intro')}
          </p>

          {/* By the Numbers - Proof Section */}
          <div className="bg-black border-2 border-[#00ff88] p-6 sm:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-[#00ff88] mb-6 uppercase">
              {t('proofTitle')}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎤</span>
                <p className="text-sm sm:text-base text-gray-300">{t('proofConferences')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <p className="text-sm sm:text-base text-gray-300">{t('proofStudents')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎙️</span>
                <p className="text-sm sm:text-base text-gray-300">{t('proofPodcast')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <p className="text-sm sm:text-base text-gray-300">{t('proofWorkflows')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Grid - Asymmetric */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {expertise.map((item, index) => (
            <div
              key={index}
              className="group relative p-8 bg-black border-2 hover:scale-105 transition-all duration-300"
              style={{
                borderColor: item.color,
                boxShadow: `0 0 20px ${item.color}20`
              }}
            >
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-4 h-4" style={{ background: item.color }}></div>
              <div className="absolute bottom-0 right-0 w-4 h-4" style={{ background: item.color }}></div>

              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement - Bold Box */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] via-[#00cfff] to-[#ff0055] opacity-30 blur"></div>
          <div className="relative bg-black border-2 border-[#00ff88] p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-black text-white mb-4 uppercase">
              {t('mission.title')}
            </h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">
              {t('mission.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 border border-[#00ff88] text-[#00ff88] font-bold text-sm">
                → {t('mission.focus1')}
              </div>
              <div className="px-4 py-2 border border-[#00cfff] text-[#00cfff] font-bold text-sm">
                → {t('mission.focus2')}
              </div>
              <div className="px-4 py-2 border border-[#ff0055] text-[#ff0055] font-bold text-sm">
                → {t('mission.focus3')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
