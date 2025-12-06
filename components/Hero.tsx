'use client';

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { trackCTAClick } from "@/lib/analytics";

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden"
      style={{ background: '#0a0a0a' }}
      aria-label="Hero section"
    >
      {/* Animated background grid - decorative only */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.1
        }}></div>
      </div>

      {/* Glowing orbs - decorative only */}
      <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20" style={{ background: '#00ff88' }} aria-hidden="true"></div>
      <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20" style={{ background: '#ff0055' }} aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto w-full py-12 sm:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <header>
              {/* Role label with better visibility */}
              <p className="text-base sm:text-lg md:text-xl font-bold text-[#00ff88] mb-4 uppercase tracking-wide">
                {t('role')}
              </p>

              {/* Main headline - clearer hierarchy */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight text-white">
                {t('headline')}
              </h1>

              {/* Subheadline - improved readability */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl mb-8 font-medium">
                {t('subheadline')}
              </p>

              {/* Role badges - clearer labels */}
              <div className="flex flex-wrap gap-3 mb-8" role="list" aria-label="Professional roles">
                <span
                  className="px-5 py-3 bg-[#00ff88]/10 text-[#00ff88] font-bold text-sm sm:text-base rounded-lg border-2 border-[#00ff88]/40"
                  role="listitem"
                >
                  <span aria-hidden="true">🎤 </span>
                  <span>Speaker</span>
                </span>
                <span
                  className="px-5 py-3 bg-[#00cfff]/10 text-[#00cfff] font-bold text-sm sm:text-base rounded-lg border-2 border-[#00cfff]/40"
                  role="listitem"
                >
                  <span aria-hidden="true">🎙️ </span>
                  <span>Podcast Host</span>
                </span>
                <span
                  className="px-5 py-3 bg-[#ff0055]/10 text-[#ff0055] font-bold text-sm sm:text-base rounded-lg border-2 border-[#ff0055]/40"
                  role="listitem"
                >
                  <span aria-hidden="true">🤖 </span>
                  <span>AI Expert</span>
                </span>
              </div>
            </header>

            {/* CTA buttons - Clear hierarchy and better contrast */}
            <nav aria-label="Primary actions">
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a
                  href="#contact"
                  className="group relative px-8 py-4 bg-[#00ff88] text-black font-black rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#00ff88]/50 text-base sm:text-lg uppercase tracking-wide text-center"
                  aria-label="Get in touch"
                  onClick={() => trackCTAClick('Get in Touch', 'hero')}
                >
                  <span className="relative z-10">{t('cta')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88] to-[#00cfff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
              </div>

              {/* Newsletter CTA - Clearer separation */}
              <div className="mt-8 pt-8 border-t-2 border-gray-800">
                <Link
                  href="/subscribe"
                  className="group inline-flex items-center gap-3 px-6 py-4 bg-black border-2 border-[#ff0055] text-[#ff0055] font-black uppercase tracking-wide hover:bg-[#ff0055] hover:text-black transition-all text-sm sm:text-base rounded-lg"
                  aria-label="Subscribe to AI news daily"
                  onClick={() => trackCTAClick('Subscribe Newsletter', 'hero')}
                >
                  <span className="text-2xl" aria-hidden="true">📬</span>
                  <span>{t('ctaNewsletter')}</span>
                  <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
                </Link>
              </div>
            </nav>
          </div>

          {/* Headshot - Bold frame */}
          <div className="relative lg:order-last" role="img" aria-label="Professional headshot">
            <div className="relative">
              {/* Animated border - decorative */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] via-[#00cfff] to-[#ff0055] rounded-3xl blur opacity-50 animate-pulse" aria-hidden="true"></div>

              {/* Headshot container */}
              <div className="relative bg-black rounded-3xl aspect-square overflow-hidden border-4 border-[#00ff88]">
                <Image
                  src="/headshot.webp"
                  alt="Idir Ouhab Meskine, Solutions Engineer at n8n, speaking at a tech conference"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - with accessible label */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-label="Scroll down for more content">
        <div className="w-6 h-10 border-2 border-[#00ff88] rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-[#00ff88] rounded-full" aria-hidden="true"></div>
        </div>
        <span className="sr-only">Scroll down to view more content</span>
      </div>
    </section>
  );
}
