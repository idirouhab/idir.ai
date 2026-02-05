import { Trophy, RotateCcw, Home, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { TestResults, Section } from '../types';

interface ResultsScreenProps {
  results: TestResults;
  sections: Section[];
  onRestart: () => void;
  locale: string;
  t: any;
}

export default function ResultsScreen({ results, sections, onRestart, locale, t }: ResultsScreenProps) {
  const percentage = Math.round((results.score / results.maxScore) * 100);

  // Get level color
  const getLevelColor = () => {
    const level = results.level.id;
    if (level === 'advanced') return '#11b981';
    if (level === 'intermediate') return '#0055ff';
    if (level === 'junior') return '#f59e0b';
    return '#ef4444';
  };

  // Generate share text
  const getShareText = () => {
    const url = typeof window !== 'undefined' ? window.location.origin + `/${locale}/automation-knowledge-test` : '';

    if (locale === 'es') {
      let text = `🎯 ¡He completado el Diagnóstico de Automatización!\n\n`;
      text += `📊 Puntuación: ${results.score}/${results.maxScore} (${percentage}%)\n`;
      text += `🏆 Nivel: ${results.level.label}\n`;
      text += `📚 Ruta recomendada: ${results.level.coursePath}\n\n`;
      text += `¿Cuál es tu nivel de automatización? Descúbrelo aquí: ${url}`;
      return text;
    }

    let text = `🎯 I just completed the Automation Skills Diagnostic!\n\n`;
    text += `📊 Score: ${results.score}/${results.maxScore} (${percentage}%)\n`;
    text += `🏆 Level: ${results.level.label}\n`;
    text += `📚 Recommended path: ${results.level.coursePath}\n\n`;
    text += `What's your automation level? Find out here: ${url}`;
    return text;
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    const text = getShareText();
    window.open(
      `https://www.linkedin.com/feed/?shareActive&mini=true&text=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=600'
    );
  };

  // Share on X.com
  const shareOnX = () => {
    const url = typeof window !== 'undefined' ? window.location.origin + `/${locale}/automation-knowledge-test` : '';
    const text = getShareText();
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Trophy size={64} className="text-[#11b981] mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          {t('results.title')}
        </h1>
      </div>

      {/* Score Card */}
      <div className="w-full max-w-2xl bg-[#0f0f0f] border border-gray-800 rounded-3xl p-8 mb-6">
        {/* Main Score */}
        <div className="text-center mb-8">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            {t('results.yourScore')}
          </p>
          <div className="text-7xl font-black mb-2">
            <span className="text-white">{results.score}</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-600">{results.maxScore}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#11b981] to-[#0055ff] transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-2xl font-bold text-gray-400">{percentage}%</p>
        </div>

        {/* Placement Level */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 text-center">
            {t('results.placementLevel')}
          </p>
          <div
            className="text-center py-4 px-6 rounded-2xl font-black text-2xl uppercase tracking-wider mb-4"
            style={{
              background: `${getLevelColor()}20`,
              color: getLevelColor(),
              border: `2px solid ${getLevelColor()}`,
            }}
          >
            {results.level.label}
          </div>

          {/* Recommended Course Path */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 mb-3">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              {t('results.recommendedPath')}
            </p>
            <p className="text-base font-bold text-white">
              {results.level.coursePath}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed">
            {results.level.description}
          </p>
        </div>

        {/* Section Breakdown */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#11b981]" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              {t('results.sectionBreakdown')}
            </p>
          </div>
          <div className="space-y-3">
            {results.breakdown.map((section) => {
              const sectionInfo = sections.find(s => s.id === section.sectionId);
              const sectionPercentage = Math.round((section.score / section.maxScore) * 100);

              return (
                <div key={section.sectionId} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{section.sectionTitle}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {sectionInfo?.difficulty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">
                        {section.score}/{section.maxScore}
                      </p>
                      <p className="text-xs text-gray-500">{sectionPercentage}%</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#11b981] transition-all duration-700"
                      style={{ width: `${sectionPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Share Results */}
      <div className="w-full max-w-2xl mb-6">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 text-center">
          {t('results.shareResults')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={shareOnLinkedIn}
            className="py-4 bg-[#0a66c210] border border-[#0a66c230] text-[#0a66c2] rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-[#0a66c220] transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
          <button
            onClick={shareOnX}
            className="py-4 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X.com
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRestart}
          className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#11b981] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          {t('results.restartTest')}
        </button>
        <Link
          href={`/${locale}`}
          className="flex-1 py-4 bg-[#0f0f0f] border-2 border-gray-800 text-white font-black uppercase tracking-widest rounded-xl hover:border-[#11b981] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Home size={18} />
          {t('results.backToHome')}
        </Link>
      </div>
    </div>
  );
}
