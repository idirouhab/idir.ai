'use client';

import { useTranslations } from "next-intl";
import { Workflow, Brain, Blocks, Mic2 } from "lucide-react";

export default function About() {
  const t = useTranslations('about');

  const expertise = [
    {
      title: t('expertise.automation.title'),
      description: t('expertise.automation.description'),
      icon: Workflow,
      color: "#10b981",
    },
    {
      title: t('expertise.ai.title'),
      description: t('expertise.ai.description'),
      icon: Brain,
      color: "#10b981",
    },
    {
      title: t('expertise.architecture.title'),
      description: t('expertise.architecture.description'),
      icon: Blocks,
      color: "#10b981",
    },
    {
      title: t('expertise.speaking.title'),
      description: t('expertise.speaking.description'),
      icon: Mic2,
      color: "#10b981",
    },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0a' }} aria-labelledby="about-heading">
      <div className="max-w-4xl mx-auto">
        {/* Simple header */}
        <header className="mb-12">
          <h2 id="about-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {t('title1')} <span className="text-[#10b981]">{t('title2')}</span>
          </h2>

          <p className="text-lg md:text-xl text-[#d1d5db] leading-relaxed mb-6">
            {t('personalIntro')}
          </p>

          <p className="text-base md:text-lg text-[#d1d5db] leading-relaxed">
            {t('intro')}
          </p>
        </header>

        {/* Simplified expertise - inline */}
        <div className="grid sm:grid-cols-2 gap-6">
          {expertise.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#10b981]/10 rounded-lg">
                    <IconComponent className="w-6 h-6 text-[#10b981]" strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#9ca3af]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
