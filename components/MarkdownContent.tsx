'use client';

import { memo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import Image from 'next/image';

// PERFORMANCE: Lightweight code highlighter that only loads when needed
// Replaces heavy react-syntax-highlighter (8.7MB) with on-demand loading
const CodeBlock = memo(function CodeBlock({ language, children }: { language: string; children: string }) {
  const [Highlighter, setHighlighter] = useState<any>(null);
  const [style, setStyle] = useState<any>(null);

  useEffect(() => {
    // Only load syntax highlighter when code blocks are actually present
    Promise.all([
      import('react-syntax-highlighter').then(mod => mod.Prism),
      import('react-syntax-highlighter/dist/esm/styles/prism').then(mod => mod.vscDarkPlus),
    ]).then(([HighlighterMod, styleMod]) => {
      setHighlighter(() => HighlighterMod);
      setStyle(styleMod);
    });
  }, []);

  if (!Highlighter || !style) {
    // Show fallback while loading
    return (
      <div className="my-6 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {language}
          </span>
        </div>
        <pre className="p-6 bg-white dark:bg-black text-gray-800 dark:text-gray-300 overflow-x-auto text-sm font-mono">
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
      <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {language}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-600">Code</span>
      </div>
      <Highlighter
        style={style}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          background: 'var(--code-bg, #000)',
          fontSize: '0.875rem',
        }}
        className="dark:bg-black bg-white"
      >
        {children}
      </Highlighter>
    </div>
  );
});

type Props = {
  content: string;
};

// SECURITY: Sanitize HTML content before rendering
// Even though content comes from our database, defense in depth is critical
// Protects against XSS if an attacker gains access to a blogger account
const MarkdownContent = memo(function MarkdownContent({ content }: Props) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
              <CodeBlock language={language}>
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            ) : (
              <code
                className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-[#10b981] dark:text-[#00ff88] rounded text-base font-mono border border-gray-300 dark:border-gray-700"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h1 id={id} className="text-4xl font-black text-gray-900 dark:text-white mb-6 mt-12 leading-tight scroll-mt-24">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h2 id={id} className="text-3xl font-black text-gray-900 dark:text-white mb-5 mt-10 leading-tight scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h3 id={id} className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8 leading-tight scroll-mt-24">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-6">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-7" style={{ lineHeight: '1.8' }}>
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#10b981] dark:text-[#00ff88] hover:text-[#059669] dark:hover:text-[#00cfff] underline transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-2 mb-6 ml-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-3 mb-6 text-lg text-gray-700 dark:text-gray-300" style={{ lineHeight: '1.8' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-lg text-gray-700 dark:text-gray-300 flex items-start gap-3" style={{ lineHeight: '1.8' }}>
              <span className="text-[#10b981] dark:text-[#00ff88] mt-1.5">→</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#10b981] dark:border-[#00ff88] bg-[#10b98110] dark:bg-[#00ff8810] pl-6 py-4 my-6 italic text-lg text-gray-700 dark:text-gray-300" style={{ lineHeight: '1.8' }}>
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="border-t-2 border-gray-300 dark:border-gray-800 my-12" />
          ),
          img: ({ src, alt }) => (
            <div className="relative w-full my-8 rounded-lg overflow-hidden border-2 border-[#10b981] dark:border-[#00ff88]">
              <Image
                src={typeof src === 'string' ? src : ''}
                alt={typeof alt === 'string' ? alt : ''}
                width={1200}
                height={675}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          ),
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto">
              <table className="min-w-full border-2 border-gray-300 dark:border-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100 dark:bg-[#1a1a1a]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-black">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-300 dark:border-gray-700">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-bold text-[#10b981] dark:text-[#00ff88] uppercase tracking-wider border-r border-gray-300 dark:border-gray-700 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-base text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-700 last:border-r-0" style={{ lineHeight: '1.6' }}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        .markdown-content {
          max-width: 100%;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
});

export default MarkdownContent;
