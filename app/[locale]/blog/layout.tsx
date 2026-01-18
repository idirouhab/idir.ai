import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSiteUrl } from '@/lib/site-config';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

    // Load translations from the 'blog' namespace
  const t = await getTranslations({ locale, namespace: 'blog' });

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/${locale}/blog`;

    const metaTitle = t('meta.title');
    const metaDescription = t('meta.description');

    // Optional: You can put keywords in JSON too, or keep them here if they rarely change
    const keywords = locale === 'es'
        ? ['IA', 'inteligencia artificial', 'automatización', 'tecnología', 'aprendizaje automático', 'innovación', 'futuro del trabajo']
        : ['AI', 'artificial intelligence', 'automation', 'technology', 'machine learning', 'innovation', 'future of work'];

  return {
    metadataBase: new URL(baseUrl),
      title: {
        default: metaTitle,
          template: `%s | Idir Ouhab Meskine`
      },
      description: metaDescription,
      keywords,
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
      title: metaTitle,
      description: metaDescription,
      type: 'website',
      url: canonicalUrl,
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      siteName: 'Idir Ouhab Meskine',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
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
