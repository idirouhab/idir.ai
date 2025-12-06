import type { Metadata } from "next";
import Script from 'next/script';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Inter, Space_Grotesk } from 'next/font/google';
import { getSiteUrl } from '@/lib/site-config';
import "../globals.css";

// PERFORMANCE: Optimize font loading - reduced to minimum weights needed
// Inter: Primary font for body text (reduced from 4 to 2 weights: 50% reduction)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'], // Only load normal and bold (removed 500, 900)
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

// Space Grotesk: Headings (reduced from 4 to 2 weights: 50% reduction)
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'], // Only semi-bold and bold (removed 400, 500)
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});

// PERFORMANCE: Removed Montserrat font entirely (saved 4 weights)
// If needed for podcast title, use Space Grotesk instead as fallback

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/${locale}`;

  // Map locale to Open Graph locale format
  const ogLocale = locale === 'es' ? 'es_ES' : 'en_US';
  const alternateLocale = locale === 'es' ? 'en_US' : 'es_ES';

  return {
    metadataBase: new URL(baseUrl),
    title: "Idir Ouhab Meskine — Automation Expert, Speaker & Podcast Host",
    description: "Solutions Engineer at n8n building AI-powered workflows. Teaching 10K+ students, speaking at DevOpsCon & WeAreDevelopers. Host of Prompt&Play podcast.",
    keywords: ["Idir Ouhab Meskine", "n8n", "Solutions Engineer", "AI", "Automation", "Workflow", "Speaker", "Prompt&Play", "Podcast", "DevOpsCon", "WeAreDevelopers", "Platzi"],
    authors: [{ name: "Idir Ouhab Meskine", url: baseUrl }],
    creator: "Idir Ouhab Meskine",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`,
      },
    },
    openGraph: {
      type: "profile",
      locale: ogLocale,
      alternateLocale: [alternateLocale],
      url: canonicalUrl,
      siteName: "Idir Ouhab Meskine",
      title: "Idir Ouhab Meskine — Automation Expert, Speaker & Podcast Host",
      description: "Solutions Engineer at n8n building AI-powered workflows. Teaching 10K+ students, speaking at DevOpsCon & WeAreDevelopers.",
      images: [
        {
          url: `${baseUrl}/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Idir Ouhab Meskine - Solutions Engineer at n8n",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@idir_ouhab",
      creator: "@idir_ouhab",
      title: "Idir Ouhab Meskine — Automation Expert & Speaker",
      description: "Solutions Engineer at n8n building AI-powered workflows. Teaching 10K+ students, speaking at major tech conferences.",
      images: [`${baseUrl}/${locale}/opengraph-image`],
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

  // Get Google Analytics ID from environment variable
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* PERFORMANCE: Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://consent.cookiebot.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://consent.cookiebot.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="antialiased">
        {/* PERFORMANCE: Cookiebot with worker strategy - loads after all other content
            This ensures GDPR compliance while minimizing performance impact */}
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="27c56185-fc2a-4afb-97a6-1058459ca692"
          data-blockingmode="auto"
          type="text/javascript"
          strategy="worker"
        />

        {/* PERFORMANCE: Google Analytics with worker strategy - loads after all other content
            Defers analytics tracking until page is fully interactive */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="worker"
            />
            <Script id="google-analytics" strategy="worker">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
