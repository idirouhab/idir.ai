import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface FeedbackPanelProps {
  correct: boolean;
  explanation: string;
  pointsEarned: number;
  totalPoints: number;
  onNext: () => void;
  t: any;
}

export default function FeedbackPanel({ correct, explanation, pointsEarned, totalPoints, onNext, t }: FeedbackPanelProps) {
  return (
    <div className={`border-2 rounded-2xl p-6 mb-6 transition-all ${
      correct
        ? 'border-[#11b981] bg-[#11b98110]'
        : 'border-[#ef4444] bg-[#ef444410]'
    }`}>
      {/* Result indicator */}
      <div className="flex items-center gap-3 mb-4">
        {correct ? (
          <CheckCircle2 size={32} className="text-[#11b981]" />
        ) : (
          <XCircle size={32} className="text-[#ef4444]" />
        )}
        <div>
          <h3 className="text-2xl font-black uppercase tracking-wider">
            {correct ? (
              <span className="text-[#11b981]">{t('feedback.correct')}</span>
            ) : (
              <span className="text-[#ef4444]">{t('feedback.incorrect')}</span>
            )}
          </h3>
          <p className="text-sm text-gray-400">
            {correct ? `+${pointsEarned}` : '0'} / {totalPoints} {t('feedback.pointsEarned')}
          </p>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            {t('feedback.explanation')}
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full mt-6 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#11b981] active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {t('test.nextQuestion')}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
