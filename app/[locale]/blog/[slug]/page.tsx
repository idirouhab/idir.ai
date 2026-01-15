import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Zap, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ViewTracker from '@/components/ViewTracker';
import Breadcrumbs from '@/components/Breadcrumbs';

// PERFORMANCE: Lazy load below-the-fold components to reduce initial bundle
// These components are not visible on initial page load, so we defer their loading
const MarkdownContent = dynamic(() => import('@/components/MarkdownContent'), {
  loading: () => <div className="min-h-[600px] animate-pulse bg-gray-900/20" />,
});

const ShareButtons = dynamic(() => import('@/components/ShareButtons'), {
  loading: () => <div className="h-16" />,
});

const PostNavigation = dynamic(() => import('@/components/PostNavigation'), {
  loading: () => <div className="h-32" />,
});

const TableOfContents = dynamic(() => import('@/components/TableOfContents'), {
  loading: () => <div className="h-24" />,
});

const NewsletterCTA = dynamic(() => import('@/components/NewsletterCTA'), {
  loading: () => <div className="h-64" />,
});

const BlogCard = dynamic(() => import('@/components/BlogCard'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-900/20" />,
});
import {
  getPublishedPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  getTranslatedPostSlug,
  formatDate,
  categoryColors,
  categoryNames,
  getAllPublishedPostSlugs,
} from '@/lib/blog';
import { BlogTranslationProvider } from '@/components/BlogTranslationContext';
import { getSiteUrl } from '@/lib/site-config';
import {ChevronDown, ScrollText} from "lucide-react";
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// PERFORMANCE: Pre-render all blog posts at build time
// This dramatically improves load times by generating static HTML for each post
export async function generateStaticParams() {
  const posts = await getAllPublishedPostSlugs();

  return posts.map((post) => ({
    locale: post.locale,
    slug: post.slug,
  }));
}

// PERFORMANCE: Incremental Static Regeneration (ISR)
// Revalidate pages every 1 hour to keep content fresh while maintaining performance
// Pages are served instantly from cache, then regenerated in the background
export const revalidate = 3600; // 1 hour in seconds

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedPostBySlug(slug, locale as 'en' | 'es');

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/${locale}/blog/${slug}`;

  // Fetch translated post slug for proper hreflang tags
  const translatedSlug = await getTranslatedPostSlug(
    post.translation_group_id,
    locale as 'en' | 'es'
  );

  // Build language alternates - only include if translation exists
  const languageAlternates: Record<string, string> = {};

  // Current language
  languageAlternates[locale] = canonicalUrl;

  // Alternate language (only if translation exists)
  if (translatedSlug) {
    const altLocale = locale === 'en' ? 'es' : 'en';
    languageAlternates[altLocale] = `${baseUrl}/${altLocale}/blog/${translatedSlug.slug}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title: `${post.title} | Idir Ouhab Meskine`,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords || undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt,
      type: 'article',
      url: canonicalUrl,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: [post.author_name || 'Idir Ouhab Meskine'],
      tags: post.tags || undefined,
      images: post.cover_image
        ? [
            {
              url: post.cover_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined, // Falls back to opengraph-image.tsx if no cover_image
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description || post.excerpt,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = await getPublishedPostBySlug(slug, locale as 'en' | 'es');

  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'blog' });

  // Fetch translated post slug for language switching
  const translatedSlug = await getTranslatedPostSlug(
    post.translation_group_id,
    locale as 'en' | 'es'
  );

  const relatedPosts = await getRelatedPosts(
    post.id,
    post.category,
    post.tags || [],
    locale as 'en' | 'es'
  );

  const { previous, next } = await getAdjacentPosts(
    post.id,
    post.published_at || post.created_at,
    locale as 'en' | 'es'
  );

  const baseUrl = 'https://idir.ai';
  const postUrl = `${baseUrl}/${locale}/blog/${slug}`;

  const categoryColor = categoryColors[post.category];
  const categoryName = categoryNames[post.category][locale as 'en' | 'es'];
  const formattedDate = formatDate(post.published_at || post.created_at, locale as 'en' | 'es');
  const readTime = post.read_time_minutes || 5;

  const breadcrumbs = [
    { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
    { label: t('title'), href: `/${locale}/blog` },
    { label: categoryName, href: `/${locale}/blog?category=${post.category}` },
    { label: post.title },
  ];

  return (
    <ThemeProvider>
      <BlogTranslationProvider translatedSlug={translatedSlug}>
        <ViewTracker postId={post.id} />
        <Navigation />
        <ThemeToggle />
        <main className="relative min-h-screen pt-28 pb-20 bg-white dark:bg-black transition-colors duration-200">
          {/* Subtle background pattern - decorative only */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>

        {/* Article Header */}
        <article className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />

          {/* Back Link */}
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-[#d1d5db] hover:text-[#10b981] transition-colors mb-8 font-bold tracking-wide uppercase"
          >
            ← {t('backToBlog')}
          </Link>

          {/* Category Badge & Read Time */}
          <div className="flex items-center flex-wrap gap-3 mb-8">
            <span
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg"
              style={{
                background: `${categoryColor}20`,
                color: categoryColor,
                border: `1px solid ${categoryColor}`,
              }}
            >
              {categoryName}
            </span>
            <span className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gray-100 dark:bg-[#111827] border border-gray-300 dark:border-[#1f2937] text-gray-600 dark:text-[#9ca3af]">
              {t('readTime', { minutes: readTime })}
            </span>
          </div>

          {/* Title - Hero style */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 mb-12 pb-12 border-b border-gray-200 dark:border-[#1f2937]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-[#10b981] to-[#14b8a6] rounded-lg flex items-center justify-center font-black text-black text-lg">
                {post.author_name ? post.author_name.slice(0, 2).toUpperCase() : 'IO'}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white">{post.author_name || 'Idir Ouhab Meskine'}</p>
                <p className="text-sm text-gray-500 dark:text-[#9ca3af] font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <TableOfContents content={post.content} locale={locale as 'en' | 'es'} />

          {/* Cover Image */}
          {post.cover_image && (
            <div className="relative w-full aspect-video mb-16 overflow-hidden rounded-xl border border-gray-200 dark:border-[#1f2937]">
              {/* Top accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ background: categoryColor }}></div>
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          )}

          {/* TL;DR / Answer Kit */}
          {post.tldr && (
            <div className="mb-16 p-8 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl">
              <h2 className="text-2xl font-bold text-[#10b981] mb-6 flex items-center gap-3 uppercase tracking-wide">
                <Zap className="w-6 h-6" strokeWidth={2.5} />
                {t('tldr')}
              </h2>
              <div className="prose dark:prose-invert prose-gray max-w-none prose-ul:my-0 prose-li:my-3 text-lg">
                <MarkdownContent content={post.tldr} />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose dark:prose-invert prose-gray max-w-none">
            <MarkdownContent content={post.content} />
          </div>

          {/* Share Buttons */}
          <div className="mt-12">
            <ShareButtons
              url={postUrl}
              title={post.title}
              locale={locale as 'en' | 'es'}
              excerpt={post.excerpt}
              tags={post.tags || []}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200 dark:border-[#1f2937]">
              <p className="text-sm text-gray-500 dark:text-[#9ca3af] uppercase tracking-wider font-bold mb-6">
                {t('tags')}
              </p>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-5 py-3 bg-gray-100 dark:bg-[#111827] border border-gray-300 dark:border-[#1f2937] text-gray-700 dark:text-[#d1d5db] font-bold text-sm rounded-lg hover:border-[#10b981] hover:text-[#10b981] transition-all hover:scale-105"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Post Navigation */}
          <PostNavigation previous={previous} next={next} locale={locale as 'en' | 'es'} />
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 pt-16 border-t border-gray-200 dark:border-[#1f2937]">
            <div className="mb-12">
              <p className="text-base sm:text-lg font-bold text-[#10b981] mb-4 uppercase tracking-wide">
                {t('relatedPosts')}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                {t('relatedPosts')}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} locale={locale as 'en' | 'es'} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter CTA - After Related Posts */}
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
          <NewsletterCTA locale={locale as 'en' | 'es'} source="blog_post_bottom" />
        </section>
      </main>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `https://idir.ai/${locale}/blog/${post.slug}#blogpost`,
            headline: post.title,
            description: post.meta_description || post.excerpt,
            image: post.cover_image || undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              '@type': 'Person',
              '@id': 'https://idir.ai/#person',
              name: post.author_name || 'Idir Ouhab Meskine',
              url: `https://idir.ai/${locale}`,
              jobTitle: 'Senior Solutions Engineer',
              worksFor: {
                '@type': 'Organization',
                '@id': 'https://n8n.io/#organization',
                name: 'n8n',
                url: 'https://n8n.io',
              },
            },
            publisher: {
              '@type': 'Person',
              '@id': 'https://idir.ai/#person',
              name: post.author_name || 'Idir Ouhab Meskine',
              url: `https://idir.ai/${locale}`,
            },
            mainEntity: {
              '@id': 'https://idir.ai/#person',
            },
            articleSection: categoryName,
            keywords: post.tags?.join(', '),
            wordCount: post.content.split(/\s+/).length,
            timeRequired: `PT${readTime}M`,
            inLanguage: locale,
            isAccessibleForFree: true,
            educationalLevel: 'Intermediate',
          }),
        }}
      />

        <Footer />
      </BlogTranslationProvider>
    </ThemeProvider>
  );
}
