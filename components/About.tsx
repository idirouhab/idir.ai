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
      color: "#11b981",
    },
    {
      title: t('expertise.ai.title'),
      description: t('expertise.ai.description'),
      icon: Brain,
      color: "#11b981",
    },
    {
      title: t('expertise.architecture.title'),
      description: t('expertise.architecture.description'),
      icon: Blocks,
      color: "#11b981",
    },
    {
      title: t('expertise.speaking.title'),
      description: t('expertise.speaking.description'),
      icon: Mic2,
      color: "#11b981",
    },
  ];

  return (
    <section id="about" className="section-pad" style={{ background: '#0a0a0a' }} aria-labelledby="about-heading">
      <div className="max-w-4xl mx-auto">
        {/* Simple header */}
        <header className="mb-12">
          <h2 id="about-heading" className="section-title mb-6 text-white">
            {t('title1')} <span className="text-[#11b981]">{t('title2')}</span>
          </h2>

          <p className="section-subtitle mb-6">
            {t('personalIntro')}
          </p>

          <p className="section-subtitle">
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
                  <div className="w-12 h-12 flex items-center justify-center bg-[#11b981]/10 rounded-lg">
                    <IconComponent className="w-6 h-6 text-[#11b981]" strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-base text-[#9ca3af]">
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
