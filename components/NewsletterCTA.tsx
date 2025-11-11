'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { trackCTAClick } from '@/lib/analytics';

type NewsletterCTAProps = {
  locale: 'en' | 'es';
  source?: string;
};

export default function NewsletterCTA({ locale, source = 'blog_post' }: NewsletterCTAProps) {
  const t = useTranslations('blog.newsletterCTA');

  return (
    <div className="my-12 border-2 border-[#ff0055] bg-black p-8 sm:p-10 relative overflow-hidden">
      {/* Corner markers */}
      <div className="absolute top-3 left-3 w-3 h-3 bg-[#ff0055]" aria-hidden="true"></div>
      <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#ff0055]" aria-hidden="true"></div>
      <div className="absolute top-3 right-3 w-3 h-3 bg-[#00ff88]" aria-hidden="true"></div>
      <div className="absolute bottom-3 left-3 w-3 h-3 bg-[#00ff88]" aria-hidden="true"></div>

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4">
          <span className="text-4xl" aria-hidden="true">📬</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 uppercase tracking-tight">
          {t('title')}
        </h3>

        {/* Description */}
        <p className="text-gray-300 mb-6 leading-relaxed max-w-2xl">
          {t('description')}
        </p>

        {/* CTA Button */}
        <Link
          href={`/${locale}/subscribe`}
          onClick={() => trackCTAClick('Newsletter CTA', source)}
          className="inline-flex items-center gap-3 px-6 py-4 bg-[#ff0055] text-white font-black uppercase tracking-wide hover:bg-[#00ff88] hover:text-black transition-all group"
        >
          <span>{t('buttonText')}</span>
          <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
        </Link>

        {/* No spam notice */}
        <p className="text-xs text-gray-500 mt-4 uppercase tracking-wide">
          ✓ {t('noSpam')}
        </p>
      </div>
    </div>
  );
}
