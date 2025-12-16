import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'courses.automation101.meta' });

  const title = t('title');
  const description = t('description');
  const ogImageUrl = `/api/og/automation-101?locale=${locale}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? 'en_US' : 'es_ES',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `/${locale}/courses/automation-101`,
      languages: {
        es: '/es/courses/automation-101',
        en: '/en/courses/automation-101',
      },
    },
    keywords: [
      'automatización',
      'automation',
      'curso automatización',
      'automation course',
      'zapier',
      'n8n',
      'no-code',
      'productividad',
      'productivity',
      'AI automation',
      'IA automatización',
      'curso en vivo',
      'live course',
      'donation based course',
      'curso basado en donación',
    ],
  };
}

export default function Automation101Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
