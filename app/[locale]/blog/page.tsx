import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts, categoryColors, BlogCategory } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type Props = {
  params: { locale: string };
  searchParams: { category?: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const baseUrl = 'https://idir.ai';
  const canonicalUrl = `${baseUrl}/${locale}/blog`;

  const metadata = {
    en: {
      title: 'Blog | Idir Ouhab Meskine - Insights on AI, Automation & Tech',
      description: 'Thoughts on AI, automation, and the future of work. Exploring insights, learnings, and opinions on technology and innovation.',
      keywords: ['AI', 'artificial intelligence', 'automation', 'technology', 'machine learning', 'innovation', 'future of work', 'tech blog'],
    },
    es: {
      title: 'Blog | Idir Ouhab Meskine - Perspectivas sobre IA, Automatización y Tecnología',
      description: 'Pensamientos sobre IA, automatización y el futuro del trabajo. Explorando perspectivas, aprendizajes y opiniones sobre tecnología e innovación.',
      keywords: ['IA', 'inteligencia artificial', 'automatización', 'tecnología', 'aprendizaje automático', 'innovación', 'futuro del trabajo', 'blog tecnológico'],
    },
  };

  const lang = locale === 'es' ? 'es' : 'en';
  const content = metadata[lang];

  return {
    metadataBase: new URL(baseUrl),
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/blog`,
        'es': `${baseUrl}/es/blog`,
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      type: 'website',
      url: canonicalUrl,
      locale: lang === 'es' ? 'es_ES' : 'en_US',
      siteName: 'Idir Ouhab Meskine',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
    },
  };
}

export default async function BlogPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'blog' });

  const category = searchParams.category as BlogCategory | undefined;
  const posts = await getPublishedPosts(locale as 'en' | 'es', undefined, category);

  const categories: BlogCategory[] = ['insights', 'learnings', 'opinion'];

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-16 bg-[#00ff88]"></div>
              <span className="text-[#00ff88] font-bold uppercase tracking-wider text-sm">
                {t('title')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              {t('title')}
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-3xl">
              {t('subtitle')}
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-12">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-4">
              {t('filterByCategory')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/blog`}
                className={`px-6 py-3 font-bold uppercase tracking-wide text-sm transition-all ${
                  !category
                    ? 'bg-white text-black'
                    : 'bg-black text-white border-2 border-gray-700 hover:border-white'
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
                    className="px-6 py-3 font-bold uppercase tracking-wide text-sm transition-all"
                    style={{
                      background: isActive ? color : 'black',
                      color: isActive ? 'black' : color,
                      border: `2px solid ${color}`,
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} locale={locale as 'en' | 'es'} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">📝</div>
                <h2 className="text-2xl font-black text-white mb-4">
                  {t('noPosts')}
                </h2>
                <p className="text-gray-400 mb-8">
                  Check back soon for insights on AI, automation, and the future of work.
                </p>
                <Link
                  href={`/${locale}`}
                  className="inline-block px-8 py-3 bg-[#00ff88] text-black font-black uppercase tracking-wide hover:scale-105 transition-transform"
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
