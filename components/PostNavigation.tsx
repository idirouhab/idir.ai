import Link from 'next/link';
import { BlogPost, categoryColors } from '@/lib/blog';

type Props = {
  previous: BlogPost | null;
  next: BlogPost | null;
  locale: 'en' | 'es';
};

export default function PostNavigation({ previous, next, locale }: Props) {
  const labels = {
    en: {
      previous: 'Previous Post',
      next: 'Next Post',
      older: 'Older',
      newer: 'Newer',
    },
    es: {
      previous: 'Post Anterior',
      next: 'Siguiente Post',
      older: 'Más Antiguo',
      newer: 'Más Reciente',
    },
  };

  const t = labels[locale];

  if (!previous && !next) {
    return null;
  }

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12 border-t-2 border-gray-800">
      {/* Previous Post */}
      <div>
        {previous ? (
          <Link
            href={`/${locale}/blog/${previous.slug}`}
            className="group block h-full p-6 bg-black border-2 border-gray-700 hover:border-[#00ff88] transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">
                ← {t.previous}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors line-clamp-2">
              {previous.title}
            </h3>
            <span
              className="inline-block mt-3 text-xs font-black uppercase px-3 py-1"
              style={{
                color: categoryColors[previous.category],
                background: `${categoryColors[previous.category]}20`,
                border: `1px solid ${categoryColors[previous.category]}`,
              }}
            >
              {previous.category}
            </span>
          </Link>
        ) : (
          <div className="h-full p-6 bg-black border-2 border-gray-800 opacity-50">
            <span className="text-sm text-gray-600 uppercase tracking-wider font-bold">
              ← {t.older}
            </span>
          </div>
        )}
      </div>

      {/* Next Post */}
      <div>
        {next ? (
          <Link
            href={`/${locale}/blog/${next.slug}`}
            className="group block h-full p-6 bg-black border-2 border-gray-700 hover:border-[#00cfff] transition-all text-right"
          >
            <div className="flex items-center justify-end gap-2 mb-3">
              <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">
                {t.next} →
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-[#00cfff] transition-colors line-clamp-2">
              {next.title}
            </h3>
            <span
              className="inline-block mt-3 text-xs font-black uppercase px-3 py-1"
              style={{
                color: categoryColors[next.category],
                background: `${categoryColors[next.category]}20`,
                border: `1px solid ${categoryColors[next.category]}`,
              }}
            >
              {next.category}
            </span>
          </Link>
        ) : (
          <div className="h-full p-6 bg-black border-2 border-gray-800 opacity-50 text-right">
            <span className="text-sm text-gray-600 uppercase tracking-wider font-bold">
              {t.newer} →
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
