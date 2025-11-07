'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');

    // SPECIAL HANDLING: If on a blog post page (/blog/[slug]), redirect to blog list
    // Blog posts are language-specific and may not exist in the other language
    if (pathWithoutLocale.match(/^\/blog\/[^/]+$/)) {
      // On a blog post page, redirect to the blog list page instead
      router.push(`/${newLocale}/blog`);
      return;
    }

    // For all other pages, maintain the same path
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Inline SVG instead of lucide-react to save ~50KB */}
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" x2="22" y1="12" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'text-white'
            : 'text-gray-300 hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-gray-600">/</span>
      <button
        onClick={() => handleLanguageChange('es')}
        className={`text-sm font-medium transition-colors ${
          locale === 'es'
            ? 'text-white'
            : 'text-gray-300 hover:text-white'
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
}
