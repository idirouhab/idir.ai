import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' });

  const baseUrl = 'https://idir.ai';
  const canonicalUrl = `${baseUrl}/${locale}/blog`;

  return {
    metadataBase: new URL(baseUrl),
    title: `${t('title')} | Idir Ouhab Meskine`,
    description: t('subtitle'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/blog`,
        'es': `${baseUrl}/es/blog`,
      },
    },
    openGraph: {
      title: `${t('title')} | Idir Ouhab Meskine`,
      description: t('subtitle'),
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('title')} | Idir Ouhab Meskine`,
      description: t('subtitle'),
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
