import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSiteUrl } from '@/lib/site-config';
import AutomationTest from './AutomationTest';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'automationTest.meta' });
  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/${locale}/automation-knowledge-test`;

  const title = t('title');
  const description = t('description');
  const keywords = t.raw('keywords') as string[];

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/automation-knowledge-test`,
        'es': `${baseUrl}/es/automation-knowledge-test`,
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
          url: `${baseUrl}/${locale}/automation-knowledge-test/opengraph-image`,
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
      images: [`${baseUrl}/${locale}/automation-knowledge-test/opengraph-image`],
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
      'application-name': 'Automation Knowledge Test',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': locale === 'es' ? 'Test de Automatización' : 'Automation Test',
      'mobile-web-app-capable': 'yes',
    },
  };
}

export default async function AutomationTestPage({ params }: Props) {
  const { locale } = await params;
  const baseUrl = getSiteUrl();
  const testUrl = `${baseUrl}/${locale}/automation-knowledge-test`;

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: locale === 'es' ? 'Diagnóstico de Habilidades en Automatización' : 'Automation Skills Diagnostic',
    description:
      locale === 'es'
        ? 'Evaluación diagnóstica profesional para determinar tu nivel desde Descubrimiento Digital hasta Arquitecto de IA/Agentes.'
        : 'Professional diagnostic assessment to determine your placement from Digital Discovery to AI/Agent Architect.',
    url: testUrl,
    inLanguage: locale,
    credentialCategory: 'Diagnostic Assessment',
    about: {
      '@type': 'Thing',
      name: locale === 'es' ? 'Automatización Técnica e IA' : 'Technical & AI Automation',
    },
    provider: {
      '@type': 'Person',
      name: 'Idir Ouhab Meskine',
      jobTitle: 'Senior Solutions Engineer at n8n',
      url: `${baseUrl}/${locale}`,
    },
    educationalLevel: locale === 'es' ? 'De principiante a experto' : 'Beginner to Expert',
    competencyRequired: locale === 'es'
      ? 'Automatización de flujos de trabajo, Integración API, Scripting, Agentes de IA, MCP'
      : 'Workflow automation, API integration, Scripting, AI agents, MCP',
    assesses: [
      locale === 'es' ? 'Fundamentos de datos y API' : 'Data & API foundations',
      locale === 'es' ? 'Lógica de flujo de trabajo' : 'Workflow logic',
      locale === 'es' ? 'Scripting y expresiones' : 'Scripting & expressions',
      locale === 'es' ? 'Agentes de IA' : 'AI agents',
      locale === 'es' ? 'Infraestructura MCP' : 'MCP infrastructure',
    ],
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
        name: locale === 'es' ? 'Diagnóstico de Automatización' : 'Automation Diagnostic',
        item: testUrl,
      },
    ],
  };

  return (
    <>
      <AutomationTest />

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
