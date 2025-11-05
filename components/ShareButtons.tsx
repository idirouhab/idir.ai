'use client';

import { useState } from 'react';

type Props = {
  url: string;
  title: string;
  locale: 'en' | 'es';
  excerpt?: string;
  tags?: string[];
};

export default function ShareButtons({ url, title, locale, excerpt, tags }: Props) {
  const [copied, setCopied] = useState(false);

  // Create engaging social media messages
  const createTwitterMessage = () => {
    const hooks = {
      en: [
        '🚀 Just published:',
        '💡 New insights:',
        '🔥 Hot take:',
        '⚡ Breaking down:',
        '🎯 Deep dive:',
      ],
      es: [
        '🚀 Acabo de publicar:',
        '💡 Nuevos insights:',
        '🔥 Opinión caliente:',
        '⚡ Desglosando:',
        '🎯 Análisis profundo:',
      ],
    };

    const ctas = {
      en: '\n\n👇 Read the full article:',
      es: '\n\n👇 Lee el artículo completo:',
    };

    const hook = hooks[locale][Math.floor(Math.random() * hooks[locale].length)];
    const hashtags = tags && tags.length > 0
      ? '\n\n' + tags.slice(0, 3).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')
      : '';

    return `${hook} ${title}${ctas[locale]} ${url}${hashtags}`;
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(createTwitterMessage())}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const labels = {
    en: {
      share: 'Share this post',
      copied: 'Copied!',
      copy: 'Copy link',
      viralTips: 'Viral sharing tips',
    },
    es: {
      share: 'Compartir este post',
      copied: '¡Copiado!',
      copy: 'Copiar link',
      viralTips: 'Tips para viralizar',
    },
  };

  const t = labels[locale];

  return (
    <div className="py-8 border-y-2 border-gray-800 space-y-6">
      <div>
        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-4">
          {t.share}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Twitter/X */}
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-black border-2 border-gray-700 text-white font-bold uppercase text-sm hover:border-[#00cfff] hover:text-[#00cfff] transition-colors flex items-center gap-2"
            aria-label="Share on Twitter"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X
          </a>

          {/* LinkedIn */}
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-black border-2 border-gray-700 text-white font-bold uppercase text-sm hover:border-[#00ff88] hover:text-[#00ff88] transition-colors flex items-center gap-2"
            aria-label="Share on LinkedIn"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 bg-black border-2 border-gray-700 text-white font-bold uppercase text-sm hover:border-white transition-colors flex items-center gap-2"
            aria-label="Copy link"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.copied}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t.copy}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Viral Tips */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-gray-400 hover:text-[#00cfff] font-bold uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {t.viralTips}
        </summary>
        <div className="mt-4 p-4 bg-black border-2 border-gray-800 space-y-2 text-sm text-gray-300">
          {locale === 'en' ? (
            <>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">1.</span>
                <span><strong>Post timing:</strong> Share on Tuesday-Thursday, 8-10 AM or 12-1 PM (your audience timezone)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">2.</span>
                <span><strong>Engage immediately:</strong> Respond to the first 3 comments within 5 minutes</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">3.</span>
                <span><strong>Thread it:</strong> Create a 3-5 tweet thread with key takeaways for X/Twitter</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">4.</span>
                <span><strong>Tag wisely:</strong> Mention 1-2 relevant accounts who might be interested</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">5.</span>
                <span><strong>Visual boost:</strong> Add a custom image or infographic for 2.3x more engagement</span>
              </p>
            </>
          ) : (
            <>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">1.</span>
                <span><strong>Horario:</strong> Comparte martes-jueves, 8-10 AM o 12-1 PM (zona horaria de tu audiencia)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">2.</span>
                <span><strong>Engagement inmediato:</strong> Responde a los primeros 3 comentarios en 5 minutos</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">3.</span>
                <span><strong>Haz un hilo:</strong> Crea un hilo de 3-5 tweets con puntos clave para X/Twitter</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">4.</span>
                <span><strong>Etiqueta con cuidado:</strong> Menciona 1-2 cuentas relevantes que puedan estar interesadas</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00ff88] font-bold">5.</span>
                <span><strong>Impulso visual:</strong> Añade una imagen o infografía personalizada para 2.3x más engagement</span>
              </p>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
