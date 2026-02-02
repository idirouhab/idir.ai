import { Play, Clock, Target, Layers } from 'lucide-react';
import { Assessment, Section } from '../types';

interface WelcomeScreenProps {
  assessment: Assessment;
  sections: Section[];
  userName: string;
  onStart: () => void;
  loading: boolean;
  t: any;
}

export default function WelcomeScreen({ assessment, sections, userName, onStart, loading, t }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      {/* Header */}
      <div className="text-center mb-12 max-w-3xl">
        <p className="text-sm font-bold text-[#11b981] mb-4 uppercase tracking-widest">
          {t('welcome.greeting', { name: userName })}
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
          {assessment.description}
        </p>
      </div>

      {/* Diagnostic Info Card */}
      <div className="w-full max-w-2xl bg-[#0f0f0f] border border-gray-800 rounded-3xl p-8 mb-8 hover:border-gray-700 transition-all">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center text-center">
            <Clock size={24} className="text-[#11b981] mb-3" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              {t('welcome.estimatedTime')}
            </p>
            <p className="text-2xl font-black text-white">{assessment.estimatedTime}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Layers size={24} className="text-[#11b981] mb-3" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              SKILL AREAS
            </p>
            <p className="text-2xl font-black text-white">{sections.length}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Target size={24} className="text-[#11b981] mb-3" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              MAX POINTS
            </p>
            <p className="text-2xl font-black text-white">{assessment.totalPoints}</p>
          </div>
        </div>

        {/* Skill Areas Overview */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
            SKILL AREAS ASSESSED
          </h3>
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div key={section.id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#11b981] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-black">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{section.title}</p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
            {t('welcome.howItWorksTitle')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#11b981] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-black">1</span>
              </div>
              <p className="text-sm text-gray-300">{t('welcome.step1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#11b981] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-black">2</span>
              </div>
              <p className="text-sm text-gray-300">{t('welcome.step2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#11b981] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-black">3</span>
              </div>
              <p className="text-sm text-gray-300">{t('welcome.step3')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#11b981] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-black">4</span>
              </div>
              <p className="text-sm text-gray-300">{t('welcome.step4')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={loading}
        className="w-full max-w-md py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-[#11b981] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin" />
            {t('test.loadingQuestions')}
          </>
        ) : (
          <>
            <Play size={20} fill="currentColor" />
            {t('welcome.startButton')}
          </>
        )}
      </button>

      {/* Version info */}
      <p className="text-xs text-gray-600 mt-6">
        Version {assessment.version}
      </p>
    </div>
  );
}
