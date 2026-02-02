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
