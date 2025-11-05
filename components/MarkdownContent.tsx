'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  content: string;
};

export default function MarkdownContent({ content }: Props) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-black text-white mb-6 mt-12 leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-black text-white mb-5 mt-10 leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-bold text-white mb-4 mt-8 leading-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-bold text-white mb-3 mt-6">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-base text-gray-300 leading-relaxed mb-6">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#00ff88] hover:text-[#00cfff] underline transition-colors"
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
            <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300 leading-relaxed flex items-start gap-3">
              <span className="text-[#00ff88] mt-1">→</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#00ff88] bg-[#00ff8810] pl-6 py-4 my-6 italic text-gray-300">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-200">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="border-t-2 border-gray-800 my-12" />
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              className="w-full rounded-lg my-8 border-2 border-[#00ff88]"
              loading="lazy"
            />
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
}
