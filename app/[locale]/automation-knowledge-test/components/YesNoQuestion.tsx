import { YesNoQuestion as YesNoQuestionType } from '../types';

interface YesNoQuestionProps {
  question: YesNoQuestionType;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
}

export default function YesNoQuestion({ question, selectedAnswer, onAnswerSelect }: YesNoQuestionProps) {
  return (
    <div className="space-y-4">
      {question.options.map((option) => (
        <button
          key={option.id}
          onClick={() => onAnswerSelect(option.id)}
          className={`w-full p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${
            selectedAnswer === option.id
              ? 'border-[#11b981] bg-[#11b98110]'
              : 'border-gray-800 bg-[#0f0f0f] hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedAnswer === option.id
                ? 'border-[#11b981] bg-[#11b981]'
                : 'border-gray-700'
            }`}>
              {selectedAnswer === option.id && (
                <div className="w-2 h-2 rounded-full bg-black" />
              )}
            </div>
            <span className="text-lg font-bold text-white">{option.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
