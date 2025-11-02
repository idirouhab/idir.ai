'use client';

import { useTranslations } from "next-intl";

export default function LiveEvent() {
  const t = useTranslations('liveEvent');

  // TOGGLE THIS: Set to true to show the live event banner, false to hide it
  const isEventActive = true;

  // EVENT DETAILS - Update these when you have a new live event
  const eventDetails = {
    title: t('title'),
    date: t('date'),
    time: t('time'),
    platform: t('platform'),
    platformUrl: t('platformUrl'),
  };

  // Don't render anything if event is not active
  if (!isEventActive) return null;

  return (
    <section className="relative py-16 px-6 lg:px-8 overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: 'radial-gradient(circle, #ff0055 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Glowing effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{ background: '#ff0055' }}></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{ background: '#00ff88', animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="border-4 p-8 md:p-12 relative" style={{
          borderColor: '#ff0055',
          boxShadow: '0 0 50px #ff005550, inset 0 0 30px #ff005520'
        }}>
          {/* Pulsing corner markers */}
          <div className="absolute top-3 left-3 w-6 h-6 animate-pulse" style={{ background: '#ff0055' }}></div>
          <div className="absolute top-3 right-3 w-6 h-6 animate-pulse" style={{ background: '#00ff88', animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 animate-pulse" style={{ background: '#00cfff', animationDelay: '0.6s' }}></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 animate-pulse" style={{ background: '#ff0055', animationDelay: '0.9s' }}></div>

          <div className="grid lg:grid-cols-[auto,1fr] gap-8 items-center">
            {/* Live indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 animate-pulse" style={{
                  borderColor: '#ff0055',
                  background: 'radial-gradient(circle, #ff0055 0%, transparent 70%)'
                }}>
                  <div className="text-4xl">🔴</div>
                </div>
                <div className="absolute inset-0 rounded-full animate-ping" style={{
                  background: '#ff0055',
                  opacity: 0.3
                }}></div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-black text-[#ff0055] uppercase tracking-tight">
                  {t('badge')}
                </div>
                <div className="text-sm text-gray-400 font-bold uppercase">
                  {t('upcoming')}
                </div>
              </div>
            </div>

            {/* Event details */}
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {eventDetails.title}
              </h3>

              <div className="flex flex-wrap gap-4 text-base sm:text-lg">
                {/* Date & Time */}
                <div className="flex items-center gap-2 text-[#00ff88]">
                  <span className="text-2xl">📅</span>
                  <span className="font-bold">{eventDetails.date}</span>
                  <span className="text-gray-500">•</span>
                  <span className="font-bold">{eventDetails.time}</span>
                </div>

                {/* Platform */}
                <div className="flex items-center gap-2 text-[#00cfff]">
                  <span className="text-2xl">📺</span>
                  <a
                    href={eventDetails.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:underline"
                  >
                    {eventDetails.platform}
                  </a>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <a
                  href={eventDetails.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#ff0055] text-white font-black uppercase tracking-wide hover:scale-105 transition-transform"
                  style={{
                    boxShadow: '0 0 30px #ff005550'
                  }}
                >
                  <span>{t('cta')}</span>
                  <span className="text-xl">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
