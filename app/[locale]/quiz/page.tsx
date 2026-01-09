import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSiteUrl } from '@/lib/site-config';
import QuizGame from './QuizGame';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quiz.meta' });
  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/${locale}/quiz`;

  const title = t('title');
  const description = t('description');
  const keywords = t('keywords') as unknown as string[];

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/quiz`,
        'es': `${baseUrl}/es/quiz`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: [locale === 'es' ? 'en_US' : 'es_ES'],
      url: canonicalUrl,
      siteName: 'Idir Ouhab Meskine',
      title,
      description,
      images: [
        {
          url: `${baseUrl}/${locale}/quiz/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@idir_ouhab',
      creator: '@idir_ouhab',
      title,
      description,
      images: [`${baseUrl}/${locale}/quiz/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'application-name': 'AI Quiz Challenge',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': locale === 'es' ? 'Quiz IA' : 'AI Quiz',
      'mobile-web-app-capable': 'yes',
    },
  };
}

export default async function QuizPage({ params }: Props) {
  const { locale } = await params;
  const baseUrl = getSiteUrl();
  const quizUrl = `${baseUrl}/${locale}/quiz`;

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: locale === 'es' ? 'Desafío Quiz IA' : 'AI Quiz Challenge',
    description:
      locale === 'es'
        ? 'Quiz interactivo sobre inteligencia artificial con ranking global. Gana puntos por velocidad y precisión.'
        : 'Interactive quiz about artificial intelligence with global leaderboard. Earn points for speed and accuracy.',
    url: quizUrl,
    inLanguage: locale,
    about: {
      '@type': 'Thing',
      name: locale === 'es' ? 'Inteligencia Artificial' : 'Artificial Intelligence',
    },
    author: {
      '@type': 'Person',
      name: 'Idir Ouhab Meskine',
      url: `${baseUrl}/${locale}`,
    },
    educationalLevel: locale === 'es' ? 'Intermedio' : 'Intermediate',
    hasPart: {
      '@type': 'WebPageElement',
      name: locale === 'es' ? 'Ranking Global' : 'Global Leaderboard',
      description:
        locale === 'es'
          ? 'Compite con jugadores de todo el mundo y alcanza el Top 5'
          : 'Compete with players worldwide and reach the Top 5',
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/PlayAction',
      userInteractionCount: 1000, // You can update this dynamically
    },
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'es' ? 'Inicio' : 'Home',
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'es' ? 'Quiz IA' : 'AI Quiz',
        item: quizUrl,
      },
    ],
  };

  return (
    <>
      <QuizGame />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
    </>
  );
}
