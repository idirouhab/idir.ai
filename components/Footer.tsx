'use client';

import { useTranslations } from "next-intl";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const contact = useTranslations('contact');

  const links = {
    navigation: [
      { label: nav('about'), href: "#about" },
      { label: nav('speaking'), href: "#speaking" },
      { label: nav('podcast'), href: "#podcast" },
      { label: nav('contact'), href: "#contact" },
    ],
    social: [
      { label: contact('platforms.linkedin'), href: "https://www.linkedin.com/in/idirouhab/" },
      { label: contact('platforms.x'), href: "https://x.com/idir_ouhab" },
      { label: contact('platforms.github'), href: "https://www.github.com/idirouhab" },
      { label: "Email", href: "mailto:hello@idir.ai" },
    ],
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ background: '#000000' }}>
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ff88] via-[#00cfff] to-[#ff0055]"></div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-[#00ff88] text-black font-black hover:scale-110 transition-transform"
        aria-label="Back to top"
      >
        ↑
      </button>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
              Idir Ouhab Meskine
            </h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              {t('descriptionStart')}
              <span className="text-[#ff0055] font-bold">{t('descriptionN8n')}</span>
              {t('descriptionMiddle')}
              <span className="italic font-bold" style={{ color: '#00CFFF' }}>{t('descriptionPodcast')}</span>
              {t('descriptionEnd')}
            </p>
            <div className="flex gap-3">
              <div className="px-3 py-1 border border-[#00ff88] text-[#00ff88] text-xs font-bold uppercase">
                AI Expert
              </div>
              <div className="px-3 py-1 border border-[#00cfff] text-[#00cfff] text-xs font-bold uppercase">
                Speaker
              </div>
              <div className="px-3 py-1 border border-[#ff0055] text-[#ff0055] text-xs font-bold uppercase">
                Podcaster
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-black text-white mb-4 uppercase text-sm tracking-wider">{t('nav')}</h4>
            <ul className="space-y-3">
              {links.navigation.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-[#00ff88] transition-colors font-medium"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-black text-white mb-4 uppercase text-sm tracking-wider">{t('connect')}</h4>
            <ul className="space-y-3">
              {links.social.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-gray-300 hover:text-[#00cfff] transition-colors font-medium"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>&copy; {currentYear} Idir Ouhab Meskine. {t('copyright')}</div>
          <div>
            {t('builtStart')}
            <span className="text-[#00ff88]">{t('builtNextjs')}</span>
            {t('builtComma1')}
            <span className="text-[#00cfff]">{t('builtTypescript')}</span>
            {t('builtAnd')}
            <span className="text-[#ff0055]">{t('builtTailwind')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
