'use client';

import { useTranslations } from "next-intl";
import messages from "@/messages/en.json";

type TransitionKey = keyof typeof messages.transitions;

type TransitionProps = {
  textKey: TransitionKey;
};

export default function Transition({ textKey }: TransitionProps) {
  const t = useTranslations('transitions');

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent"></div>
          <p className="text-[#10b981] font-bold text-sm sm:text-base uppercase tracking-wider">
            {t(textKey)}
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
