'use client';

import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Podcast() {
  const t = useTranslations('podcast');

  return (
    <section id="podcast" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Background effect - responsive */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[600px] md:h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#00CFFF' }}></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[600px] md:h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#FF6B6B' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border-2 mb-6" style={{
              borderColor: '#00CFFF',
              background: '#00CFFF10'
            }}>
              <span className="text-3xl">🎙️</span>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#00CFFF' }}>
                {t('label')}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight font-[family-name:var(--font-montserrat)]">
              <span className="italic" style={{
                background: 'linear-gradient(135deg, #00CFFF 0%, #FF6B6B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {t('title')}
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed mb-6">
              {t('description')}
            </p>

            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('topicsLabel')}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {(['topics.0', 'topics.1', 'topics.2', 'topics.3'] as const).map((key, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                    <div className="w-2 h-2 rotate-45" style={{ background: '#00CFFF' }}></div>
                    {t(key)}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://open.spotify.com/show/6q4QWGY41LcM3LRhtaWDvF?si=6babdcd148e345f6"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3 bg-[#1DB954] text-white font-bold uppercase tracking-wide hover:scale-105 transition-transform"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                {t('platforms.spotify')}
              </a>
              <a
                href="https://www.youtube.com/@Prompt_and_Play"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3 bg-[#FF0000] text-white font-bold uppercase tracking-wide hover:scale-105 transition-transform"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                {t('platforms.youtube')}
              </a>
              <a
                href="https://podimo.com/es/shows/prompt-and-play"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3 bg-[#805CFA] text-white font-bold uppercase tracking-wide hover:scale-105 transition-transform"
              >
                <svg viewBox="0 0 48 48" fill="currentColor" className="w-6 h-6">
                  <path d="M22.9459,35.744V6.0382c0-.8495.6887-1.5382,1.5382-1.5382h0c8.5966,0,15.5655,6.9689,15.5655,15.5655v1.6512c0,8.5966-6.9689,15.5655-15.5655,15.5655h0c-.8495,0-1.5382-.6887-1.5382-1.5382Z"/>
                  <path d="M7.9504,27.2169V5.6184c0-.6177.5007-1.1184,1.1184-1.1184h0c6.2504,0,11.3174,5.067,11.3174,11.3174v1.2006c0,6.2504-5.067,11.3174-11.3174,11.3174h0c-.6177,0-1.1184-.5007-1.1184-1.1184Z"/>
                  <circle cx="14.1683" cy="37.2821" r="6.2179"/>
                </svg>
                {t('platforms.podimo')}
              </a>
            </div>
          </div>

          {/* Podcast Player */}
          <div className="relative space-y-6">
            {/* Logo - Compact version */}
            <div className="flex items-center justify-center gap-4 p-6 border-2 border-[#00CFFF] bg-black">
              <Image
                src="/logo.png"
                alt="Prompt&Play Podcast Logo"
                width={64}
                height={64}
                className="object-contain"
                loading="lazy"
              />
              <div>
                <h3 className="text-2xl font-black text-white italic font-[family-name:var(--font-montserrat)]">
                  Prompt&Play
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00CFFF' }}></div>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wide">
                    {t('status')}
                  </span>
                </div>
              </div>
            </div>

            {/* Spotify Player Embed */}
            <div className="relative border-2 border-[#00CFFF] p-4 bg-black">
              <iframe
                style={{ borderRadius: '12px' }}
                src="https://open.spotify.com/embed/show/6q4QWGY41LcM3LRhtaWDvF?utm_source=generator&theme=0"
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Prompt&Play Podcast on Spotify"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
