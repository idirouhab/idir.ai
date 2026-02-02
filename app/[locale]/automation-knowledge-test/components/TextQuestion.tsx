import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { TextQuestion as TextQuestionType } from '../types';

interface TextQuestionProps {
  question: TextQuestionType;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export default function TextQuestion({ question, answer, onAnswerChange }: TextQuestionProps) {
  const [text, setText] = useState(answer || '');
  const isValid = text.length <= question.maxLength;
  const isTooLong = text.length > question.maxLength;

  useEffect(() => {
    onAnswerChange(text);
  }, [text, onAnswerChange]);

  const getBorderColor = () => {
    if (!text) return 'border-gray-800';
    if (isTooLong) return 'border-red-500';
    if (isValid && text.length > 0) return 'border-[#11b981]';
    return 'border-gray-800';
  };

  const getCharCountColor = () => {
    if (isTooLong) return 'text-red-500';
    if (text.length > 0 && isValid) return 'text-[#11b981]';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={question.placeholder}
        className={`w-full h-40 bg-black border-2 rounded-2xl px-5 py-4 outline-none transition-all resize-none text-white placeholder:text-gray-600 ${getBorderColor()}`}
      />

      {/* Character counter */}
      <div className="flex justify-between items-center text-xs">
        <span className={`font-bold ${getCharCountColor()}`}>
          {text.length} / {question.maxLength} characters
        </span>
      </div>

      {/* Validation message */}
      {isTooLong && (
        <p className="text-xs text-red-500 font-medium">
          Please remove {text.length - question.maxLength} character{text.length - question.maxLength !== 1 ? 's' : ''}
        </p>
      )}

      {/* Evaluation criteria */}
      {question.evaluationCriteria && question.evaluationCriteria.length > 0 && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-[#11b981]" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              EVALUATION CRITERIA
            </p>
          </div>
          <ul className="space-y-2">
            {question.evaluationCriteria.map((criterion, idx) => (
              <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">•</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
