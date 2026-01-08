'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

const MarkdownContent = dynamic(() => import('@/components/MarkdownContent'), {
  loading: () => <div className="p-4 text-gray-400">Loading preview...</div>,
  ssr: false,
});

type FullScreenEditorProps = {
  content: string;
  onChange: (value: string) => void;
  language: 'en' | 'es';
  title: string;
  onClose: () => void;
  onSave?: () => void;
  onMetadataClick: () => void;
  isEditMode: boolean;
  onLanguageChange?: (lang: 'en' | 'es', content: string) => void;
  contentEn?: string;
  contentEs?: string;
};

export default function FullScreenEditor({
  content,
  onChange,
  language,
  title,
  onClose,
  onSave,
  onMetadataClick,
  isEditMode,
  onLanguageChange,
  contentEn,
  contentEs,
}: FullScreenEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local content when prop changes (e.g., language switch)
  useEffect(() => {
    setLocalContent(content);
    setHasUnsavedChanges(false);
  }, [content]);

  // Track unsaved changes
  useEffect(() => {
    if (localContent !== content) {
      setHasUnsavedChanges(true);
    }
  }, [localContent, content]);

  // Handle content change with real-time sync to parent
  const handleContentChange = (value: string) => {
    setLocalContent(value);
    onChange(value);
  };

  // Handle close with confirmation if unsaved changes
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to exit?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Handle save
   const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    }
    setHasUnsavedChanges(false);
    onClose();
   }, [onSave, onClose]);

  // Handle language switch
  const handleLanguageSwitch = (newLang: 'en' | 'es') => {
    if (newLang === language) return;

    if (hasUnsavedChanges) {
      if (!confirm(`Switch to ${newLang === 'en' ? 'English' : 'Spanish'}? Current changes will be saved automatically.`)) {
        return;
      }
    }

    if (onLanguageChange) {
      onLanguageChange(newLang, localContent);
    }
  };

  // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onMetadataClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, handleSave, onMetadataClick]);


    // Markdown toolbar functions
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);
    const newText = localContent.substring(0, start) + before + selectedText + after + localContent.substring(end);

    handleContentChange(newText);

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

  // Memoize preview content
  const previewContent = useMemo(() => localContent, [localContent]);

  // Detect if on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]">
      {/* Header */}
      <div className="h-16 bg-[#1a1a1a] border-b-2 border-gray-700 flex items-center justify-between px-6">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <h2 className="text-white font-bold text-lg truncate max-w-md" title={title || 'Untitled'}>
            {title || 'Untitled Post'}
          </h2>
          {hasUnsavedChanges && (
            <span className="text-xs text-yellow-500">● Unsaved</span>
          )}
        </div>

        {/* Center: Language switcher (create mode only) */}
        {!isEditMode && onLanguageChange && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLanguageSwitch('en')}
              className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${
                language === 'en'
                  ? 'bg-[#00ff88] text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('es')}
              className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${
                language === 'es'
                  ? 'bg-[#00cfff] text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              🇪🇸 Spanish
            </button>
          </div>
        )}

        {/* Edit mode: Show language badge */}
        {isEditMode && (
          <div className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-bold uppercase">
            Editing: {language === 'en' ? '🇬🇧 English' : '🇪🇸 Spanish'}
          </div>
        )}

        {/* Right: Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMetadataClick}
            className="px-4 py-2 bg-[#00cfff] text-black font-bold uppercase hover:bg-[#00e5ff] transition-colors text-sm"
            title="Open metadata panel (Cmd+K)"
          >
            📋 Metadata
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#00ff88] text-black font-bold uppercase hover:scale-105 transition-transform text-sm"
            title="Save and exit (Cmd+S)"
          >
            💾 Save
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-[#ff0055] text-white font-bold hover:bg-[#ff0077] transition-colors text-sm"
            title="Close editor (ESC)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Mobile warning */}
      {isMobile && (
        <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-bold">
          ⚠️ Full-screen editor works best on desktop. Consider using a larger screen for the best experience.
        </div>
      )}

      {/* Split-pane content */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-0 ${isMobile ? 'h-[calc(100vh-96px)]' : 'h-[calc(100vh-64px)]'}`}>
        {/* Left pane: Editor */}
        <div className="border-r-2 border-gray-700 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-1 flex-wrap bg-[#1a1a1a] border-b-2 border-gray-700 p-2">
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

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`Start writing in ${language === 'en' ? 'English' : 'Spanish'}...`}
            className="flex-1 w-full px-6 py-4 bg-black text-white focus:outline-none font-mono text-sm resize-none"
            autoFocus
          />
        </div>

        {/* Right pane: Preview (hidden on mobile) */}
        {!isMobile && (
          <div className="overflow-y-auto bg-black px-8 py-6">
            {previewContent ? (
              <MarkdownContent content={previewContent} />
            ) : (
              <div className="text-gray-500 italic p-8 text-center">
                No content to preview yet. Start writing to see the live preview!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
