'use client';

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { trackCTAClick } from "@/lib/analytics";

export default function Hero() {
  const t = useTranslations('hero');
  const tAria = useTranslations('aria');

  return (
    <section
      className="section-pad relative min-h-screen flex items-center overflow-hidden"
      style={{ background: '#000000' }}
      aria-label={tAria('heroSection')}
    >
      {/* Subtle background pattern - decorative only */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #11b981 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="section-container w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <header>
              {/* Role label with better visibility */}
              <p className="text-base sm:text-lg md:text-xl font-bold text-[#11b981] mb-4 uppercase tracking-wide">
                {t('role')}
              </p>

              {/* Main headline - clearer hierarchy */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6 tracking-tight text-white">
                {t('headline')}
              </h1>

              {/* Subheadline - improved readability */}
              <p className="section-subtitle text-lg sm:text-xl md:text-2xl max-w-2xl mb-8">
                {t('subheadline')}
              </p>
            </header>

            {/* Primary CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-neutral-200 transition-colors"
                onClick={() => trackCTAClick('Book Training', 'hero')}
              >
                {t('ctaPrimary')}
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-semibold rounded-md hover:border-white/60 hover:bg-white/5 transition-colors"
                onClick={() => trackCTAClick('Request Consulting', 'hero')}
              >
                {t('ctaSecondary')}
              </Link>
            </div>

            {/* Social links moved to footer */}
          </div>

          {/* Headshot - Clean border with template styling */}
          <div className="relative lg:order-last" role="img" aria-label={tAria('professionalHeadshot')}>
            <div className="relative">
              {/* Clean emerald border */}
              <div className="relative bg-black rounded-lg aspect-square overflow-hidden border border-[#1f2937]">
                {/* Emerald top border accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#11b981]" aria-hidden="true"></div>
                <Image
                  src="/headshot.webp"
                  alt={tAria('imageAlt')}
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
    </section>
  );
}
