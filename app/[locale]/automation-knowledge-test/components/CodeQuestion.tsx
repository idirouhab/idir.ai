import { useState, useEffect } from 'react';
import { FileCode, Play } from 'lucide-react';
import { CodeQuestion as CodeQuestionType } from '../types';

interface CodeQuestionProps {
  question: CodeQuestionType;
  answer: { language: string; code: string };
  onAnswerChange: (answer: { language: string; code: string }) => void;
}

export default function CodeQuestion({ question, answer, onAnswerChange }: CodeQuestionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(answer?.language || question.languages[0].id);
  const [code, setCode] = useState(answer?.code || '');

  // Load template when language changes (only if code is empty or matches previous template)
  useEffect(() => {
    if (!answer?.code) {
      const lang = question.languages.find(l => l.id === selectedLanguage);
      if (lang) {
        setCode(lang.template);
      }
    }
  }, [selectedLanguage, question.languages, answer]);

  useEffect(() => {
    onAnswerChange({ language: selectedLanguage, code });
  }, [selectedLanguage, code, onAnswerChange]);

  const handleLanguageChange = (langId: string) => {
    const lang = question.languages.find(l => l.id === langId);
    if (lang) {
      setSelectedLanguage(langId);
      setCode(lang.template);
    }
  };

  return (
    <div className="space-y-4">
      {/* Language tabs - only show if multiple languages */}
      {question.languages.length > 1 && (
        <div className="flex gap-2 border-b border-gray-800">
          {question.languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                selectedLanguage === lang.id
                  ? 'border-b-2 border-[#11b981] text-[#11b981]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {lang.label || lang.id.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Code editor (styled textarea) */}
      <div className="bg-[#0a0a0a] border-2 border-gray-800 rounded-2xl overflow-hidden focus-within:border-[#11b981] transition-all">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-[#0f0f0f]">
          <FileCode size={14} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500">{selectedLanguage === 'javascript' ? 'index.js' : 'main.py'}</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-72 bg-transparent p-6 font-mono text-sm text-gray-300 resize-none focus:outline-none"
          spellCheck={false}
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Input/Output examples - only show if provided */}
      {(question.inputExample || question.expectedOutput) && (
        <div className="grid md:grid-cols-2 gap-4">
          {question.inputExample && (
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Play size={12} className="text-[#11b981]" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  INPUT EXAMPLE
                </p>
              </div>
              <pre className="text-xs font-mono text-gray-400 overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(question.inputExample, null, 2)}
              </pre>
            </div>
          )}
          {question.expectedOutput && (
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Play size={12} className="text-[#11b981]" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  EXPECTED OUTPUT
                </p>
              </div>
              <pre className="text-xs font-mono text-gray-400 overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(question.expectedOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Evaluation criteria - only show if provided */}
      {question.evaluationCriteria && question.evaluationCriteria.length > 0 && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
            EVALUATION CRITERIA
          </p>
          <ul className="space-y-1">
            {question.evaluationCriteria.map((criterion, idx) => (
              <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-gray-600">•</span>
                {criterion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
