'use client';

import { useTranslations } from 'next-intl';

export default function Process() {
  const t = useTranslations('process');

  const steps = [
    { title: t('steps.0.title'), description: t('steps.0.description') },
    { title: t('steps.1.title'), description: t('steps.1.description') },
    { title: t('steps.2.title'), description: t('steps.2.description') },
  ];

  return (
    <section id="process" className="section-pad bg-[#0a0a0a]" aria-labelledby="process-heading">
      <div className="section-container">
        <header className="mb-10 md:mb-14">
          <h2 id="process-heading" className="section-title mb-4 text-white">
            {t('title')}
          </h2>
          <p className="section-subtitle max-w-3xl">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="card-surface card-accent">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#11b981] mb-3">
                {t('stepLabel')} {idx + 1}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
