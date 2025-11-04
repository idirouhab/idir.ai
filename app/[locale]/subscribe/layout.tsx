import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'subscribe' });

  const baseUrl = 'https://idir.ai';
  const canonicalUrl = `${baseUrl}/${locale}/subscribe`;
  const title = `${t('title1')} ${t('title2')} | Idir Ouhab`;
  const description = t('description');

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/subscribe`,
        'es': `${baseUrl}/es/subscribe`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
