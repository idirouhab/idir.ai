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
      style={{ background: '#000000' }}
      aria-label="Hero section"
    >
      {/* Subtle background pattern - decorative only */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto w-full py-12 sm:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <header>
              {/* Role label with better visibility */}
              <p className="text-base sm:text-lg md:text-xl font-bold text-[#10b981] mb-4 uppercase tracking-wide">
                {t('role')}
              </p>

              {/* Main headline - clearer hierarchy */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight text-white">
                {t('headline')}
              </h1>

              {/* Subheadline - improved readability */}
              <p className="text-lg sm:text-xl md:text-2xl text-[#d1d5db] leading-relaxed max-w-2xl mb-8 font-medium">
                {t('subheadline')}
              </p>
            </header>

            {/* Simple social links */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.linkedin.com/in/idirouhab/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1d5db] hover:text-[#10b981] transition-colors"
                aria-label="LinkedIn"
                onClick={() => trackCTAClick('LinkedIn', 'hero')}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://x.com/idir_ouhab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1d5db] hover:text-[#10b981] transition-colors"
                aria-label="X (Twitter)"
                onClick={() => trackCTAClick('X/Twitter', 'hero')}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@Prompt_and_Play"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1d5db] hover:text-[#10b981] transition-colors"
                aria-label="YouTube"
                onClick={() => trackCTAClick('YouTube', 'hero')}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://github.com/idirouhab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1d5db] hover:text-[#10b981] transition-colors"
                aria-label="GitHub"
                onClick={() => trackCTAClick('GitHub', 'hero')}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Headshot - Clean border with template styling */}
          <div className="relative lg:order-last" role="img" aria-label="Professional headshot">
            <div className="relative">
              {/* Clean emerald border */}
              <div className="relative bg-black rounded-lg aspect-square overflow-hidden border border-[#1f2937]">
                {/* Emerald top border accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#10b981]" aria-hidden="true"></div>
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
        <div className="w-6 h-10 border-2 border-[#10b981] rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-[#10b981] rounded-full" aria-hidden="true"></div>
        </div>
        <span className="sr-only">Scroll down to view more content</span>
      </div>
    </section>
  );
}
