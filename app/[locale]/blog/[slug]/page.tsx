import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MarkdownContent from '@/components/MarkdownContent';
import BlogCard from '@/components/BlogCard';
import ViewTracker from '@/components/ViewTracker';
import ShareButtons from '@/components/ShareButtons';
import PostNavigation from '@/components/PostNavigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import TableOfContents from '@/components/TableOfContents';
import NewsletterCTA from '@/components/NewsletterCTA';
import {
  getPublishedPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  getTranslatedPostSlug,
  formatDate,
  categoryColors,
  categoryNames,
} from '@/lib/blog';
import { BlogTranslationProvider } from '@/components/BlogTranslationContext';

type Props = {
  params: { locale: string; slug: string };
};

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const post = await getPublishedPostBySlug(slug, locale as 'en' | 'es');

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const baseUrl = 'https://idir.ai';
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

export default async function BlogPostPage({ params: { locale, slug } }: Props) {
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
    <BlogTranslationProvider translatedSlug={translatedSlug}>
      <ViewTracker postId={post.id} />
      <Navigation />
      <main className="min-h-screen pt-28 pb-20" style={{ background: '#0a0a0a' }}>
        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />

          {/* Back Link */}
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-[#00ff88] transition-colors mb-8 font-bold uppercase tracking-wide"
          >
            ← {t('backToBlog')}
          </Link>

          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="px-4 py-2 text-xs font-black uppercase tracking-wider"
              style={{
                background: `${categoryColor}20`,
                color: categoryColor,
                border: `2px solid ${categoryColor}`,
              }}
            >
              {categoryName}
            </span>
            <span className="text-sm text-gray-500">
              {t('readTime', { minutes: readTime })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00ff88] to-[#00cfff] rounded-full flex items-center justify-center font-black text-black">
                {post.author_name ? post.author_name.slice(0, 2).toUpperCase() : 'IO'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{post.author_name || 'Idir Ouhab Meskine'}</p>
                <p className="text-xs text-gray-500">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <TableOfContents content={post.content} locale={locale as 'en' | 'es'} />

          {/* Cover Image */}
          {post.cover_image && (
            <div className="relative w-full aspect-video mb-12 border-4 overflow-hidden" style={{ borderColor: categoryColor }}>
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

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <MarkdownContent content={post.content} />
          </div>

          {/* Newsletter CTA - After Content */}
          <NewsletterCTA locale={locale as 'en' | 'es'} source="blog_post_after_content" />

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
            <div className="mt-12 pt-8 border-t-2 border-gray-800">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-4">
                {t('tags')}
              </p>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-black border-2 border-gray-700 text-gray-300 font-bold text-sm uppercase tracking-wide hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-16 bg-[#ff0055]"></div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
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
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
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
            headline: post.title,
            description: post.meta_description || post.excerpt,
            image: post.cover_image || undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              '@type': 'Person',
              name: post.author_name || 'Idir Ouhab Meskine',
              url: `https://idir.ai/${locale}`,
            },
            publisher: {
              '@type': 'Person',
              name: post.author_name || 'Idir Ouhab Meskine',
            },
            articleSection: categoryName,
            keywords: post.tags?.join(', '),
            wordCount: post.content.split(/\s+/).length,
            timeRequired: `PT${readTime}M`,
            inLanguage: locale,
          }),
        }}
      />

      <Footer />
    </BlogTranslationProvider>
  );
}
