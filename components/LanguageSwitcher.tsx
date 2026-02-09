'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useBlogTranslation } from './BlogTranslationContext';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const translatedSlug = useBlogTranslation();

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');

    let targetUrl: string;

    // SPECIAL HANDLING: If on a blog post page (/blog/[slug])
    if (pathWithoutLocale.match(/^\/blog\/[^/]+$/)) {
      // Check if this post has a translation
      if (translatedSlug) {
        // Redirect to the translated post
        targetUrl = `/${translatedSlug.language}/blog/${translatedSlug.slug}`;
      } else {
        // Single-language post: redirect to blog list
        targetUrl = `/${newLocale}/blog`;
      }
    } else {
      // For all other pages, maintain the same path
      targetUrl = `/${newLocale}${pathWithoutLocale}`;
    }

    // Use window.location for a full page reload to ensure locale changes
    window.location.href = targetUrl;
  };

  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`transition-colors ${
          locale === 'en'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-gray-600">·</span>
      <button
        onClick={() => handleLanguageChange('es')}
        className={`transition-colors ${
          locale === 'es'
            ? 'text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
}
