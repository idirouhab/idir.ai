'use client';

import { useEffect, useState } from 'react';

type Heading = {
  id: string;
  text: string;
  level: number;
};

type Props = {
  content: string;
  locale: 'en' | 'es';
};

export default function TableOfContents({ content, locale }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extractedHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);

    // Track scroll position to highlight active heading
    const handleScroll = () => {
      const headingElements = extractedHeadings.map((h) => ({
        id: h.id,
        element: document.getElementById(h.id),
      }));

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i].element;
        if (el && el.getBoundingClientRect().top < 100) {
          setActiveId(headingElements[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  if (headings.length < 3) {
    return null; // Don't show TOC for short posts
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <nav className="mb-12 p-6 bg-black border-2 border-gray-800">
      <h2 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
        <span className="text-[#00cfff]">📚</span>
        {locale === 'es' ? 'Tabla de Contenidos' : 'Table of Contents'}
      </h2>

      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ marginLeft: `${(heading.level - 1) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`text-sm transition-colors block py-1 ${
                activeId === heading.id
                  ? 'text-[#00ff88] font-bold'
                  : 'text-gray-300 hover:text-[#00cfff]'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
