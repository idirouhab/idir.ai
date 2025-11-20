import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-config';
import QuizGame from './QuizGame';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/${locale}/quiz`;

  const title = locale === 'es'
    ? 'Desafío Quiz IA - Pon a Prueba tus Conocimientos de Inteligencia Artificial'
    : 'AI Quiz Challenge - Test Your Artificial Intelligence Knowledge';

  const description = locale === 'es'
    ? 'Participa en nuestro quiz interactivo de IA y compite en el ranking global. Responde preguntas sobre inteligencia artificial, machine learning, y tecnología. ¡Gana puntos por velocidad y precisión!'
    : 'Take our interactive AI quiz and compete on the global leaderboard. Answer questions about artificial intelligence, machine learning, and technology. Earn points for speed and accuracy!';

  const keywords = locale === 'es'
    ? [
        'quiz de IA',
        'inteligencia artificial',
        'test de AI',
        'machine learning',
        'quiz interactivo',
        'tecnología',
        'ranking IA',
        'quiz de tecnología',
        'aprender IA',
        'desafío IA'
      ]
    : [
        'AI quiz',
        'artificial intelligence',
        'AI test',
        'machine learning',
        'interactive quiz',
        'technology',
        'AI leaderboard',
        'tech quiz',
        'learn AI',
        'AI challenge'
      ];

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
          url: `${baseUrl}/quiz/og-image.png`,
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
      images: [`${baseUrl}/quiz/og-image.png`],
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

export default function QuizPage({ params: { locale } }: Props) {
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
