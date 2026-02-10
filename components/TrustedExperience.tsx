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
      className="py-10 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-y border-gray-800/50"
      aria-label={t('title')}
    >
      <div className="section-container">
        <div className="text-center mb-6 flex items-center justify-center gap-3 text-[#9ca3af]">
          <span className="section-kicker">{t('kicker')}</span>
          <span className="text-sm">•</span>
        </div>
        {/* Slim Logo Row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center h-10 md:h-12"
              aria-label={`Visit ${partner.name}`}
            >
              <div className="relative w-28 md:w-32 h-full">
                <Image
                  src={partner.logo}
                  alt={partner.alt}
                  fill
                  className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  sizes="(max-width: 640px) 120px, 140px"
                  priority={false}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
