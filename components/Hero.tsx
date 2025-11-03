'use client';

import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.1
        }}></div>
      </div>

      {/* Glowing orbs - contained */}
      <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20" style={{ background: '#00ff88' }}></div>
      <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20" style={{ background: '#ff0055' }}></div>

      <div className="max-w-7xl mx-auto w-full py-12 sm:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">

            {/* Giant name */}
            <div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-[#00ff88] mb-3 uppercase tracking-wide">
                {t('role')}
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 tracking-tight">
                <span className="text-white">{t('headline')}</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mb-6">
                {t('subheadline')}
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-[#00ff88]/10 text-[#00ff88] font-semibold rounded-lg border border-[#00ff88]/30">
                  🎤 Speaker
                </span>
                <span className="px-4 py-2 bg-[#00cfff]/10 text-[#00cfff] font-semibold rounded-lg border border-[#00cfff]/30">
                  🎙️ Podcast Host
                </span>
                <span className="px-4 py-2 bg-[#ff0055]/10 text-[#ff0055] font-semibold rounded-lg border border-[#ff0055]/30">
                  🤖 AI Expert
                </span>
              </div>
            </div>

            {/* CTA buttons - Clear hierarchy */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
              <a
                href="#contact"
                className="group relative px-8 py-4 bg-[#00ff88] text-black font-black rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#00ff88]/50 text-base uppercase tracking-wide"
              >
                <span className="relative z-10">{t('cta')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88] to-[#00cfff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
            </div>

            {/* Newsletter CTA - Prominent */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <a
                href="/subscribe"
                className="group inline-flex items-center gap-3 px-6 py-3 bg-black border-2 border-[#ff0055] text-[#ff0055] font-black uppercase tracking-wide hover:bg-[#ff0055] hover:text-black transition-all text-sm"
              >
                <span className="text-xl">📬</span>
                <span>{t('ctaNewsletter')}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

          {/* Headshot - Bold frame */}
          <div className="relative lg:order-last">
            <div className="relative">
              {/* Animated border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] via-[#00cfff] to-[#ff0055] rounded-3xl blur opacity-50 animate-pulse"></div>

              {/* Headshot container */}
              <div className="relative bg-black rounded-3xl aspect-square overflow-hidden border-4 border-[#00ff88]">
                <Image
                  src="/headshot.jpg"
                  alt="Idir Ouhab Meskine"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#00ff88] rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-[#00ff88] rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
