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
    {
      title: t('aiops.title'),
      description: t('aiops.description'),
      icon: Server,
    },
  ];

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#000000' }} aria-labelledby="services-heading">
      <div className="max-w-4xl mx-auto">
        {/* Simple header */}
        <header className="mb-12">
          <h2 id="services-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {t('title')}
          </h2>

          <p className="text-base md:text-lg text-[#d1d5db] leading-relaxed mb-8">
            {t('description')}
          </p>
        </header>

        {/* Services Grid - Compact */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-[#10b981]/10 rounded-lg">
                  <IconComponent className="w-8 h-8 text-[#10b981]" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
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
            className="inline-block px-6 py-3 bg-[#10b981] text-black font-bold rounded hover:bg-[#059669] transition-colors"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
