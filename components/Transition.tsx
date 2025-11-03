'use client';

import { useTranslations } from "next-intl";

interface TransitionProps {
  textKey: 'aboutIntro' | 'speakingIntro' | 'podcastIntro' | 'contactIntro';
}

export default function Transition({ textKey }: TransitionProps) {
  const t = useTranslations('transitions');

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent"></div>
          <p className="text-[#00ff88] font-bold text-sm sm:text-base uppercase tracking-wider animate-pulse">
            {t(textKey)}
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
