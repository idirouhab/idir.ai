'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import Image from 'next/image';

// Dynamic import for syntax highlighter to reduce bundle size (~100KB savings)
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.Prism),
  { ssr: false }
);

// Dynamic import for theme
const vscDarkPlusPromise = import('react-syntax-highlighter/dist/esm/styles/prism').then(
  mod => mod.vscDarkPlus
);

type Props = {
  content: string;
};

// Custom sanitization schema that allows HTML while keeping security
const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [
      ...(defaultSchema.attributes?.['*'] || []),
      'className',
      'style',
      'id',
      'width',
      'height',
      'align',
      'target',
      'rel',
    ],
    div: ['className', 'style', 'id', 'dataType'],
    span: ['className', 'style', 'id'],
    iframe: ['src', 'width', 'height', 'frameBorder', 'allow', 'allowFullScreen', 'title', 'className', 'style'],
    video: ['src', 'controls', 'width', 'height', 'autoPlay', 'loop', 'muted', 'poster', 'className'],
    audio: ['src', 'controls', 'autoPlay', 'loop', 'muted', 'className'],
    source: ['src', 'type'],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'div',
    'span',
    'iframe',
    'video',
    'audio',
    'source',
    'details',
    'summary',
    'figure',
    'figcaption',
    'mark',
    'abbr',
    'time',
    'sub',
    'sup',
  ],
};

const MarkdownContent = memo(function MarkdownContent({ content }: Props) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
              <div className="my-6 rounded-lg overflow-hidden border-2 border-gray-700">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {language}
                  </span>
                  <span className="text-xs text-gray-600">Code</span>
                </div>
                <SyntaxHighlighter
                  style={{}}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: '#000',
                    fontSize: '0.875rem',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="px-2 py-1 bg-gray-900 text-[#00ff88] rounded text-sm font-mono border border-gray-700"
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
              <h1 id={id} className="text-4xl font-black text-white mb-6 mt-12 leading-tight scroll-mt-24">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h2 id={id} className="text-3xl font-black text-white mb-5 mt-10 leading-tight scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return (
              <h3 id={id} className="text-2xl font-bold text-white mb-4 mt-8 leading-tight scroll-mt-24">
                {children}
              </h3>
            );
          },
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
            <div className="relative w-full my-8 rounded-lg overflow-hidden border-2 border-[#00ff88]">
              <Image
                src={src || ''}
                alt={alt || ''}
                width={1200}
                height={675}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          ),
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto">
              <table className="min-w-full border-2 border-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1a1a1a]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-black">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-700">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-bold text-[#00ff88] uppercase tracking-wider border-r border-gray-700 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-sm text-gray-300 border-r border-gray-700 last:border-r-0">
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
