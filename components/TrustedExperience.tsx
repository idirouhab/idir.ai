'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function TrustedExperience() {
  const t = useTranslations('trustedExperience');

  const partners = [
    {
      name: 'n8n',
      logo: '/logos/n8n.svg',
      url: 'https://n8n.io',
      alt: 'n8n - Workflow Automation Platform'
    },
    {
      name: 'GitLab',
      logo: '/logos/gitlab.svg',
      url: 'https://gitlab.com',
      alt: 'GitLab - DevOps Platform'
    },
    {
      name: 'Platzi',
      logo: '/logos/platzi.svg',
      url: 'https://platzi.com',
      alt: 'Platzi - Education Platform'
    }
  ];

  return (
    <section
      className="py-16 md:py-20 bg-[#0a0a0a] border-y border-gray-800/50"
      aria-labelledby="trusted-experience-heading"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            id="trusted-experience-heading"
            className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider mb-2"
          >
            {t('title')}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            {t('subtitle')}
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 items-center justify-items-center">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-full max-w-[180px] h-16 md:h-20 transition-all duration-300"
              aria-label={`Visit ${partner.name}`}
            >
              {/* Logo */}
              <div className="relative w-full h-full">
                <Image
                  src={partner.logo}
                  alt={partner.alt}
                  fill
                  className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  sizes="(max-width: 640px) 180px, 200px"
                  priority={false}
                />
              </div>

              {/* Hover Glow Effect */}
              <div
                className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 rounded-lg transition-all duration-300 -z-10"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>

        {/* Optional: Subtle decoration line */}
        <div className="mt-12 flex justify-center">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}
