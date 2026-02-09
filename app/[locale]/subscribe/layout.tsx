import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
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
  return (
    <ThemeProvider>
      <Navigation />
      <ThemeToggle />
      {children}
      <Footer />
    </ThemeProvider>
  );
}
