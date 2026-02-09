'use client';

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Zap, GraduationCap, Presentation, Server } from "lucide-react";

export default function Services() {
  const t = useTranslations('services');

  const services = [
    {
      title: t('enablement.title'),
      description: t('enablement.description'),
      icon: Zap,
    },
    {
      title: t('training.title'),
      description: t('training.description'),
      icon: GraduationCap,
    },
    {
      title: t('talks.title'),
      description: t('talks.description'),
      icon: Presentation,
    },
  ];

  return (
    <section id="services" className="section-pad" style={{ background: '#000000' }} aria-labelledby="services-heading">
      <div className="section-container">
        {/* Simple header */}
        <header className="mb-12">
          <h2 id="services-heading" className="section-title mb-6 text-white">
            {t('title')}
          </h2>

          <p className="section-subtitle mb-8">
            {t('description')}
          </p>
        </header>

        {/* Services Grid - Compact */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="text-left card-surface card-accent">
                <div className="flex items-center justify-center w-10 h-10 mb-4 bg-[#11b981]/10 rounded-md">
                  <IconComponent className="w-5 h-5 text-[#11b981]" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="#contact"
            className="inline-block px-6 py-3 bg-[#11b981] text-black font-bold rounded hover:bg-[#0f9f73] transition-colors"
          >
            {t('cta')}
          </Link>
        </div>

        <div className="mt-10">
          <h3 className="text-sm uppercase tracking-wider text-[#9ca3af] font-semibold mb-3">
            {t('trainingHighlights.title')}
          </h3>
          <ul className="grid md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <li key={i} className="card-surface">
                <p className="text-sm text-[#e5e7eb]">{t(`trainingHighlights.items.${i}`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
