'use client';

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const contact = useTranslations('contact');
  const tCommon = useTranslations('common');
  const tAria = useTranslations('aria');
  const locale = pathname?.split('/')[1] || 'en';

  const links = {
    navigation: [
      { label: nav('services'), href: "#services" },
      { label: nav('speaking'), href: "#speaking" },
      { label: nav('contact'), href: "#contact" },
      { label: nav('blog'), href: "/blog" },
      { label: nav('newsletter'), href: "/subscribe" },
    ],
    social: [
      { label: contact('platforms.linkedin'), href: "https://www.linkedin.com/in/idirouhab/" },
      { label: contact('platforms.x'), href: "https://x.com/idir_ouhab" },
      { label: contact('platforms.github'), href: "https://www.github.com/idirouhab" },
      { label: tCommon('email'), href: "mailto:hello@idir.ai" },
    ],
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ background: '#000000' }}>
      {/* Top border accent with emerald green */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#11b981]"></div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-[#11b981] text-black font-black rounded hover:bg-[#0f9f73] transition-colors"
        aria-label={tAria('backToTop')}
      >
        ↑
      </button>

      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
              Idir Ouhab Meskine
            </h3>
            <p className="text-[#d1d5db] leading-relaxed mb-6">
              {t('descriptionStart')}
              <span className="text-[#11b981] font-bold">{t('descriptionN8n')}</span>
              {t('descriptionMiddle')}
              <span className="italic font-bold text-[#11b981]">{t('descriptionPodcast')}</span>
              {t('descriptionEnd')}
            </p>
            <div className="flex gap-3">
              <div className="px-3 py-1 border border-[#11b981] text-[#11b981] text-xs font-bold uppercase rounded">
                {tCommon('badges.aiExpert')}
              </div>
              <div className="px-3 py-1 border border-[#11b981] text-[#11b981] text-xs font-bold uppercase rounded">
                {tCommon('badges.speaker')}
              </div>
              <div className="px-3 py-1 border border-[#11b981] text-[#11b981] text-xs font-bold uppercase rounded">
                {tCommon('badges.podcaster')}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-black text-white mb-4 uppercase text-base tracking-wider">{t('nav')}</h4>
            <ul className="space-y-3">
              {links.navigation.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-[#d1d5db] hover:text-[#11b981] transition-colors font-medium"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-black text-white mb-4 uppercase text-base tracking-wider">{t('connect')}</h4>
            <ul className="space-y-3">
              {links.social.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-[#d1d5db] hover:text-[#11b981] transition-colors font-medium"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1f2937] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-base text-[#9ca3af]">
          <div>&copy; {currentYear} Idir Ouhab Meskine. {t('copyright')}</div>
          <div className="flex items-center gap-4">
            <a
              href={`/${locale}/privacy`}
              className="hover:text-[#11b981] transition-colors"
            >
              {t('privacyPolicy')}
            </a>
            <span aria-hidden="true">•</span>
            <a
              href={`/${locale}/terms`}
              className="hover:text-[#11b981] transition-colors"
            >
              {t('termsConditions')}
            </a>
          </div>
          <div>
            {t('builtStart')}
            <span className="text-[#11b981]">{t('builtNextjs')}</span>
            {t('builtComma1')}
            <span className="text-[#11b981]">{t('builtTypescript')}</span>
            {t('builtAnd')}
            <span className="text-[#11b981]">{t('builtTailwind')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
