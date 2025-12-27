'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { trackPodcastClick } from "@/lib/analytics";

export default function Podcast() {
  const t = useTranslations('podcast');
  const [loadSpotify, setLoadSpotify] = useState(false);

  return (
    <section id="podcast" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0a' }} aria-labelledby="podcast-heading">
      <div className="max-w-4xl mx-auto">
        {/* Simple header */}
        <header className="mb-8">
          <h2 id="podcast-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title')}
          </h2>

          <p className="text-base md:text-lg text-[#d1d5db] leading-relaxed mb-6">
            {t('description')}
          </p>
        </header>

        <div className="space-y-6">
          {/* Podcast Player */}
          <div className="relative" aria-label="Podcast player">
            {/* Spotify Player Embed */}
            <div className="rounded-lg overflow-hidden" role="region" aria-label="Spotify podcast player">
              {!loadSpotify ? (
                <button
                  onClick={() => {
                    setLoadSpotify(true);
                    trackPodcastClick('Spotify Player');
                  }}
                  className="w-full group relative overflow-hidden rounded-lg bg-[#111827] hover:bg-[#1f2937] transition-colors"
                  style={{ height: '352px' }}
                  aria-label="Load Spotify Player"
                >
                  {/* Placeholder */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
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

                    <div className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center group-hover:bg-[#059669] transition-colors">
                      <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-white font-medium">
                      Click to load Spotify player
                    </p>
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
          </div>

          {/* Platform Links - Simple */}
          <div className="flex flex-wrap gap-3">
            <a
              href="https://open.spotify.com/show/6q4QWGY41LcM3LRhtaWDvF?si=6babdcd148e345f6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d1d5db] hover:text-[#10b981] transition-colors text-sm"
              onClick={() => trackPodcastClick('Spotify')}
            >
              Spotify
            </a>
            <span className="text-[#1f2937]">•</span>
            <a
              href="https://www.youtube.com/@Prompt_and_Play"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d1d5db] hover:text-[#10b981] transition-colors text-sm"
              onClick={() => trackPodcastClick('YouTube')}
            >
              YouTube
            </a>
            <span className="text-[#1f2937]">•</span>
            <a
              href="https://podimo.com/es/shows/prompt-and-play"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d1d5db] hover:text-[#10b981] transition-colors text-sm"
              onClick={() => trackPodcastClick('Podimo')}
            >
              Podimo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
