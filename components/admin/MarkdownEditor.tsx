'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const MarkdownContent = dynamic(() => import('@/components/MarkdownContent'), {
  loading: () => <div className="p-4 text-gray-400">Loading preview...</div>,
  ssr: false,
});

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  borderColor?: string;
  height?: number;
};

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  borderColor = 'border-gray-700',
  height = 500,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertTable = () => {
    const tableTemplate = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n';
    insertMarkdown(tableTemplate, '');
  };

  const toolbarButtons = [
    { icon: 'B', label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: 'I', label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: 'H1', label: 'Heading 1', action: () => insertMarkdown('# ', '') },
    { icon: 'H2', label: 'Heading 2', action: () => insertMarkdown('## ', '') },
    { icon: 'H3', label: 'Heading 3', action: () => insertMarkdown('### ', '') },
    { icon: '• ', label: 'Bullet List', action: () => insertMarkdown('\n- ', '') },
    { icon: '1.', label: 'Numbered List', action: () => insertMarkdown('\n1. ', '') },
    { icon: '<>', label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: '```', label: 'Code Block', action: () => insertMarkdown('\n```\n', '\n```\n') },
    { icon: '""', label: 'Quote', action: () => insertMarkdown('\n> ', '') },
    { icon: '🔗', label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: '⊞', label: 'Table', action: insertTable },
  ];

  return (
    <div className={`w-full border-2 ${borderColor} focus-within:border-[#00ff88]`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#1a1a1a] border-b-2 border-gray-700 p-2">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={btn.action}
              title={btn.label}
              className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-[#00ff88] hover:bg-[#1f1f1f] transition-colors"
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Preview Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors ${
              !showPreview
                ? 'bg-[#00ff88] text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors ${
              showPreview
                ? 'bg-[#00ff88] text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="overflow-y-auto px-4 py-3 bg-black"
          style={{ height: `${height}px` }}
        >
          {value ? (
            <MarkdownContent content={value} />
          ) : (
            <div className="text-gray-500 italic p-8 text-center">
              No content to preview yet. Switch to Edit mode to start writing!
            </div>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-black text-white focus:outline-none font-mono text-sm resize-none"
          style={{ height: `${height}px` }}
        />
      )}
    </div>
  );
}
