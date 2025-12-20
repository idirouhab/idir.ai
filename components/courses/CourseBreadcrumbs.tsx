'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Props = {
  locale: 'en' | 'es';
  courseTitle: string;
  translations: {
    home: string;
    courses: string;
  };
};

export default function CourseBreadcrumbs({ locale, courseTitle, translations }: Props) {
  // Structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": translations.home,
        "item": `https://idir.ai/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": translations.courses,
        "item": `https://idir.ai/${locale}/courses`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": courseTitle,
        "item": typeof window !== 'undefined' ? window.location.href : ''
      }
    ]
  };

  return (
    <>
      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
        <ol className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
          <li>
            <Link href={`/${locale}`} className="hover:text-emerald-400 transition-colors">
              {translations.home}
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </li>
          <li>
            <Link href={`/${locale}/courses`} className="hover:text-emerald-400 transition-colors">
              {translations.courses}
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </li>
          <li className="text-white truncate max-w-[200px] md:max-w-none" title={courseTitle}>
            {courseTitle}
          </li>
        </ol>
      </nav>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
