import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { getPublishedPosts, categoryColors, BlogCategory } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import NewsletterCTA from '@/components/NewsletterCTA';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

// Metadata is handled in layout.tsx to avoid duplication

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: 'blog' });

  const category = resolvedSearchParams.category as BlogCategory | undefined;
  const posts = await getPublishedPosts(locale as 'en' | 'es', undefined, category);

  const categories: BlogCategory[] = ['insights', 'learnings', 'opinion'];

  const breadcrumbs = [
    { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
    { label: t('title') },
  ];

  return (
    <>
      <Navigation />
      <main className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: '#000000' }}>
        {/* Subtle background pattern - decorative only */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />

          {/* Header - Hero style */}
          <header className="mb-20">
            <p className="text-base sm:text-lg md:text-xl font-bold text-[#10b981] mb-6 uppercase tracking-wide">
              {t('title')}
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
              {t('title')}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-[#d1d5db] leading-relaxed max-w-3xl font-medium">
              {t('subtitle')}
            </p>
          </header>

          {/* Category Filter */}
          <div className="mb-16">
            <p className="text-sm text-[#9ca3af] uppercase tracking-wider font-bold mb-6">
              {t('filterByCategory')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/blog`}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-wide transition-all rounded-xl ${
                  !category
                    ? 'bg-[#10b981] text-black scale-105'
                    : 'bg-[#111827] text-white border border-[#1f2937] hover:border-[#10b981] hover:scale-105'
                }`}
              >
                {t('allCategories')}
              </Link>

              {categories.map((cat) => {
                const isActive = category === cat;
                const color = categoryColors[cat];

                return (
                  <Link
                    key={cat}
                    href={`/${locale}/blog?category=${cat}`}
                    className="px-6 py-3 font-bold text-sm uppercase tracking-wide transition-all rounded-xl hover:scale-105"
                    style={{
                      background: isActive ? color : '#111827',
                      color: isActive ? '#000000' : color,
                      border: `1px solid ${isActive ? color : '#1f2937'}`,
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {t(`categories.${cat}`)}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} locale={locale as 'en' | 'es'} />
                ))}
              </div>

              {/* Newsletter CTA - After Posts */}
              <div className="mt-20 max-w-4xl mx-auto">
                <NewsletterCTA locale={locale as 'en' | 'es'} source="blog_listing" />
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="mb-6 flex justify-center">
                  <FileText className="w-16 h-16 text-[#10b981]" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">
                  {t('noPosts')}
                </h2>
                <p className="text-[#d1d5db] mb-8 font-medium">
                  Check back soon for insights on AI, automation, and the future of work.
                </p>
                <Link
                  href={`/${locale}`}
                  className="inline-block px-8 py-3 bg-[#10b981] text-black font-bold rounded-lg hover:scale-105 transition-transform"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
