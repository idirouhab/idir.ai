'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { BlogPost, categoryColors, formatDate } from '@/lib/blog';

type Props = {
  post: BlogPost;
  locale: 'en' | 'es';
};

export default function BlogCard({ post, locale }: Props) {
  const t = useTranslations('blog');

  const categoryColor = categoryColors[post.category];
  const categoryName = t(`categories.${post.category}`);
  const formattedDate = formatDate(post.published_at || post.created_at, locale);
  const readTime = post.read_time_minutes || 5;

  return (
    <Link href={`/${locale}/blog/${post.slug}`}>
      <article className="group relative bg-black border-2 hover:scale-[1.02] transition-all duration-300 h-full flex flex-col"
        style={{ borderColor: categoryColor }}>

        {/* Corner accent */}
        <div className="absolute top-0 left-0 w-4 h-4" style={{ background: categoryColor }}></div>
        <div className="absolute bottom-0 right-0 w-4 h-4" style={{ background: categoryColor }}></div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="px-3 py-1 text-xs font-black uppercase tracking-wider"
              style={{
                background: `${categoryColor}20`,
                color: categoryColor,
                border: `1px solid ${categoryColor}`,
              }}
            >
              {categoryName}
            </span>
            <span className="text-xs text-gray-500">
              {t('readTime', { minutes: readTime })}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-white mb-3 leading-tight group-hover:text-[#00ff88] transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-gray-300 leading-relaxed mb-4 flex-1">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{formattedDate}</span>
              {post.author_name && (
                <span className="text-xs text-gray-400">
                  {t('by')} {post.author_name}
                </span>
              )}
            </div>
            <span className="text-sm font-bold uppercase tracking-wide group-hover:translate-x-1 transition-transform"
              style={{ color: categoryColor }}>
              {t('readMore')} →
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-500 px-2 py-1 bg-gray-900 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
