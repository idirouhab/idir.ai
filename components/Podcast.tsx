'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { trackPodcastClick } from "@/lib/analytics";

export default function Podcast() {
  const t = useTranslations('podcast');
  const [loadSpotify, setLoadSpotify] = useState(false);

  return (
    <section id="podcast" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#0a0a0a' }} aria-labelledby="podcast-heading">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header consistent with other sections */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-1 w-12 bg-[#10b981]" aria-hidden="true"></div>
            <span className="text-[#10b981] font-bold uppercase tracking-wider text-sm sm:text-base">{t('label')}</span>
          </div>

          <h2 id="podcast-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            {t('title')}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-[#d1d5db] leading-relaxed max-w-3xl mb-8">
            {t('description')}
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Content */}
          <div>

            {/* Topics Card with professional styling */}
            <div className="bg-[#111827] border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-6 mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 uppercase tracking-wide">{t('topicsLabel')}</h3>
              <ul className="space-y-3 list-none">
                {(['topics.0', 'topics.1', 'topics.2', 'topics.3'] as const).map((key, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#d1d5db] font-medium">
                    <span className="text-[#10b981] text-xl" aria-hidden="true">▸</span>
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform Links with professional styling */}
            <nav aria-label="Podcast platforms">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Escuchar en:</h3>
              <div className="space-y-3">
                <a
                  href="https://open.spotify.com/show/6q4QWGY41LcM3LRhtaWDvF?si=6babdcd148e345f6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 bg-[#111827] border border-[#1f2937] rounded-lg text-white font-bold hover:border-[#10b981] transition-colors text-sm sm:text-base"
                  aria-label="Listen on Spotify"
                  onClick={() => trackPodcastClick('Spotify')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span className="flex-1">{t('platforms.spotify')}</span>
                  <span className="text-[#10b981]" aria-hidden="true">→</span>
                </a>
                <a
                  href="https://www.youtube.com/@Prompt_and_Play"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 bg-[#111827] border border-[#1f2937] rounded-lg text-white font-bold hover:border-[#10b981] transition-colors text-sm sm:text-base"
                  aria-label="Watch on YouTube"
                  onClick={() => trackPodcastClick('YouTube')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="flex-1">{t('platforms.youtube')}</span>
                  <span className="text-[#10b981]" aria-hidden="true">→</span>
                </a>
                <a
                  href="https://podimo.com/es/shows/prompt-and-play"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 bg-[#111827] border border-[#1f2937] rounded-lg text-white font-bold hover:border-[#10b981] transition-colors text-sm sm:text-base"
                  aria-label="Listen on Podimo"
                  onClick={() => trackPodcastClick('Podimo')}
                >
                  <svg viewBox="0 0 48 48" fill="currentColor" className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                    <path d="M22.9459,35.744V6.0382c0-.8495.6887-1.5382,1.5382-1.5382h0c8.5966,0,15.5655,6.9689,15.5655,15.5655v1.6512c0,8.5966-6.9689,15.5655-15.5655,15.5655h0c-.8495,0-1.5382-.6887-1.5382-1.5382Z"/>
                    <path d="M7.9504,27.2169V5.6184c0-.6177.5007-1.1184,1.1184-1.1184h0c6.2504,0,11.3174,5.067,11.3174,11.3174v1.2006c0,6.2504-5.067,11.3174-11.3174,11.3174h0c-.6177,0-1.1184-.5007-1.1184-1.1184Z"/>
                    <circle cx="14.1683" cy="37.2821" r="6.2179"/>
                  </svg>
                  <span className="flex-1">{t('platforms.podimo')}</span>
                  <span className="text-[#10b981]" aria-hidden="true">→</span>
                </a>
              </div>
            </nav>
          </div>

          {/* Podcast Player - Professional Styling */}
          <aside className="relative" aria-label="Podcast player">
            {/* Spotify Player Embed with professional card styling */}
            <div className="border border-[#1f2937] border-l-[3px] border-l-[#10b981] rounded-lg p-4 bg-[#111827]" role="region" aria-label="Spotify podcast player">
              {!loadSpotify ? (
                <button
                  onClick={() => {
                    setLoadSpotify(true);
                    trackPodcastClick('Spotify Player');
                  }}
                  className="w-full group relative overflow-hidden rounded-lg"
                  style={{ height: '352px' }}
                  aria-label="Load Spotify Player"
                >
                  {/* Professional Placeholder */}
                  <div className="absolute inset-0 bg-[#0a0a0a] border-2 border-[#1f2937] rounded-lg flex flex-col items-center justify-center gap-6 group-hover:border-[#10b981] transition-colors">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                      <Image
                        src="/logo.png"
                        alt="Prompt&Play Podcast Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                        loading="lazy"
                      />
                      <div className="text-left">
                        <h3 className="text-2xl font-black text-white">
                          Prompt&Play
                        </h3>
                        <p className="text-[#9ca3af] text-sm font-bold uppercase tracking-wide">
                          Podcast
                        </p>
                      </div>
                    </div>

                    {/* Spotify Logo */}
                    <svg viewBox="0 0 24 24" fill="#ffffff" className="w-16 h-16 opacity-50">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>

                    <div className="text-center px-6">
                      <p className="text-white font-bold text-base mb-2">
                        {t('loadPlayer') || 'Cargar reproductor de Spotify'}
                      </p>
                      <p className="text-[#9ca3af] text-sm">
                        {t('privacyNotice') || 'Click para cargar el contenido'}
                      </p>
                    </div>

                    {/* Play Button */}
                    <div className="w-14 h-14 rounded-full bg-[#10b981] flex items-center justify-center group-hover:bg-[#059669] transition-colors">
                      <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </button>
              ) : (
                <iframe
                  style={{ borderRadius: '8px' }}
                  src="https://open.spotify.com/embed/show/6q4QWGY41LcM3LRhtaWDvF?utm_source=generator&theme=0"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Prompt&Play Podcast on Spotify"
                />
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
