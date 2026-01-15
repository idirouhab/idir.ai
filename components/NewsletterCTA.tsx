'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Mail, Check, ArrowRight } from 'lucide-react';
import { trackCTAClick } from '@/lib/analytics';

type NewsletterCTAProps = {
  locale: 'en' | 'es';
  source?: string;
};

export default function NewsletterCTA({ locale, source = 'blog_post' }: NewsletterCTAProps) {
  const t = useTranslations('blog.newsletterCTA');

  return (
    <div className="my-12 border border-gray-200 dark:border-[#1f2937] bg-gray-50 dark:bg-[#0a0a0a] p-8 sm:p-12 rounded-xl relative overflow-hidden">
      {/* Top accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#10b981]" aria-hidden="true"></div>

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-6">
          <Mail className="w-12 h-12 text-[#10b981]" strokeWidth={2} />
        </div>

        {/* Label */}
        <p className="text-sm font-bold text-[#10b981] mb-4 uppercase tracking-wide">
          {t('title')}
        </p>

        {/* Title */}
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          {t('title')}
        </h3>

        {/* Description */}
        <p className="text-lg text-gray-700 dark:text-[#d1d5db] mb-8 leading-relaxed max-w-2xl font-medium">
          {t('description')}
        </p>

        {/* CTA Button */}
        <Link
          href={`/${locale}/subscribe`}
          onClick={() => trackCTAClick('Newsletter CTA', source)}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#10b981] text-white dark:text-black font-bold uppercase tracking-wide rounded-lg hover:scale-105 transition-all group"
        >
          <span>{t('buttonText')}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
        </Link>

        {/* No spam notice */}
        <p className="text-sm text-gray-500 dark:text-[#9ca3af] mt-6 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-[#10b981]" strokeWidth={2.5} />
          {t('noSpam')}
        </p>
      </div>
    </div>
  );
}
