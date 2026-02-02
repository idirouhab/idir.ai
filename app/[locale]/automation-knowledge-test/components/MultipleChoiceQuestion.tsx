import { Code2 } from 'lucide-react';
import { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '../types';

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestionType;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
}

export default function MultipleChoiceQuestion({ question, selectedAnswer, onAnswerSelect }: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      {/* Display context data if present */}
      {question.contextData && (
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={16} className="text-[#11b981]" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              CONTEXT DATA
            </p>
          </div>
          <pre className="text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(question.contextData, null, 2)}
          </pre>
        </div>
      )}

      {/* Options */}
      {question.options.map((option) => (
        <button
          key={option.id}
          onClick={() => onAnswerSelect(option.id)}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] active:scale-95 ${
            selectedAnswer === option.id
              ? 'border-[#11b981] bg-[#11b98110]'
              : 'border-gray-800 bg-[#0f0f0f] hover:border-gray-700'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              selectedAnswer === option.id
                ? 'border-[#11b981] bg-[#11b981]'
                : 'border-gray-700'
            }`}>
              {selectedAnswer === option.id && (
                <div className="w-2 h-2 rounded-full bg-black" />
              )}
            </div>
            <span className="text-base text-gray-300 leading-relaxed">{option.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
