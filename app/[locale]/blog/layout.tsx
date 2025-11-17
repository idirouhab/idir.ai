import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSiteUrl } from '@/lib/site-config';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' });

  const baseUrl = getSiteUrl();
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
      types: {
        'application/rss+xml': `${baseUrl}/${locale}/blog/rss.xml`,
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

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
