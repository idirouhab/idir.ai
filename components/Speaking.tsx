'use client';

import { useTranslations } from "next-intl";

export default function Speaking() {
  const t = useTranslations('speaking');

  const topics = [
    {
      title: t('topics.ai.title'),
      description: t('topics.ai.description'),
      tags: [t('topics.ai.tags.0'), t('topics.ai.tags.1'), t('topics.ai.tags.2')],
      color: "#00ff88",
    },
    {
      title: t('topics.llm.title'),
      description: t('topics.llm.description'),
      tags: [t('topics.llm.tags.0'), t('topics.llm.tags.1'), t('topics.llm.tags.2')],
      color: "#00cfff",
    },
    {
      title: t('topics.dx.title'),
      description: t('topics.dx.description'),
      tags: [t('topics.dx.tags.0'), t('topics.dx.tags.1'), t('topics.dx.tags.2')],
      color: "#ff0055",
    },
  ];

  return (
    <section id="speaking" className="py-24 px-6 lg:px-8 relative" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-1 w-12 bg-[#00cfff]"></div>
            <span className="text-[#00cfff] font-bold uppercase tracking-wider text-sm">{t('label')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {t('title1')}
            <br />
            <span className="text-[#00cfff]">{t('title2')}</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
            {t('description')}
          </p>
        </div>

        {/* Topics - Staggered layout */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {topics.map((topic, index) => (
            <div
              key={index}
              className="group bg-black border-2 p-8 hover:translate-y-[-8px] transition-all duration-300"
              style={{
                borderColor: topic.color,
                marginTop: index % 2 === 0 ? '0' : '3rem'
              }}
            >
              <h3 className="text-2xl font-black text-white mb-4 uppercase leading-tight">
                {topic.title}
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {topic.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {topic.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-bold uppercase tracking-wide"
                    style={{
                      background: `${topic.color}20`,
                      color: topic.color,
                      border: `1px solid ${topic.color}40`
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
