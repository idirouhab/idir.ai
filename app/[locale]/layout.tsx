import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import "../globals.css";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const baseUrl = 'https://idir.ai';
  const canonicalUrl = `${baseUrl}/${locale}`;

  // Map locale to Open Graph locale format
  const ogLocale = locale === 'es' ? 'es_ES' : 'en_US';
  const alternateLocale = locale === 'es' ? 'en_US' : 'es_ES';

  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    keywords: ["Idir Ouhabmeskine", "n8n", "Solutions Engineer", "AI", "Automation", "Speaker", "Prompt&Play", "Podcast"],
    authors: [{ name: "Idir Ouhabmeskine" }],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`,
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: [alternateLocale],
      url: canonicalUrl,
      siteName: "Idir Ouhabmeskine",
      title: t('ogTitle'),
      description: t('ogDescription'),
    },
    twitter: {
      card: "summary_large_image",
      title: t('twitterTitle'),
      description: t('twitterDescription'),
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
    verification: {
      google: "your-google-verification-code",
    },
  };
}

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
