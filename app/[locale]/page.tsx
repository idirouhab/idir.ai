import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveEvent from "@/components/LiveEvent";
import Transition from "@/components/Transition";
import Footer from "@/components/Footer";
import {getTranslations} from 'next-intl/server';
import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import dynamic from 'next/dynamic';

// PERFORMANCE: Lazy load below-the-fold components (not visible on initial load)
// This reduces initial JavaScript bundle by ~200KB
const About = dynamic(() => import('@/components/About'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Speaking = dynamic(() => import('@/components/Speaking'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Podcast = dynamic(() => import('@/components/Podcast'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Contact = dynamic(() => import('@/components/Contact'), {
  loading: () => <div className="min-h-[400px]" />,
});

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

type Props = {
  params: { locale: string };
};

// PERFORMANCE: Use React cache to prevent duplicate queries
const getActiveEvent = cache(async () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error fetching active event:', error);
    return null;
  }
});

export default async function Home({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'structuredData' });
  const activeEvent = await getActiveEvent();

  // Get structured data arrays
  const knowsAbout = [
    t('knowsAbout.0'),
    t('knowsAbout.1'),
    t('knowsAbout.2'),
    t('knowsAbout.3'),
    t('knowsAbout.4'),
    t('knowsAbout.5'),
  ];

  const podcastGenre = [
    t('podcastGenre.0'),
    t('podcastGenre.1'),
    t('podcastGenre.2'),
  ];

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <LiveEvent locale={locale} eventData={activeEvent} />
        <Transition textKey="aboutIntro" />
        <About />
        <Transition textKey="speakingIntro" />
        <Speaking />
        <Transition textKey="podcastIntro" />
        <Podcast />
        <Transition textKey="contactIntro" />
        <Contact />
      </main>
      <Footer />

      {/* JSON-LD Structured Data for SEO and AI discoverability */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Idir Ouhab Meskine",
            url: `https://idir.ai/${locale}`,
            jobTitle: t('jobTitle'),
            worksFor: {
              "@type": "Organization",
              name: "n8n",
              url: "https://n8n.io",
            },
            knowsAbout,
            sameAs: [
              "https://linkedin.com/in/idir-Ouhab Meskine",
              "https://twitter.com/idir",
              "https://github.com/idir",
            ],
            alumniOf: {
              "@type": "EducationalOrganization",
              name: "Technology",
            },
            description: t('description'),
            contactPoint: {
              "@type": "ContactPoint",
              email: "hello@idir.ai",
              contactType: "Professional",
            },
            inLanguage: locale,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PodcastSeries",
            name: "Prompt&Play",
            description: t('podcastDescription'),
            inLanguage: "es",
            author: {
              "@type": "Person",
              name: "Idir Ouhab Meskine",
            },
            genre: podcastGenre,
            url: "https://idir.ai/podcast",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: "Idir Ouhab Meskine",
              description: t('description'),
              knowsAbout,
            },
          }),
        }}
      />
      {/* Event Structured Data - Only when active event exists */}
      {activeEvent && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: activeEvent.title,
              description: `Live ${activeEvent.platform} event with Idir Ouhab Meskine`,
              startDate: activeEvent.event_datetime,
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
              location: {
                "@type": "VirtualLocation",
                url: activeEvent.platform_url,
              },
              organizer: {
                "@type": "Person",
                name: "Idir Ouhab Meskine",
                url: `https://idir.ai/${locale}`,
              },
              performer: {
                "@type": "Person",
                name: "Idir Ouhab Meskine",
              },
              inLanguage: activeEvent.event_language,
              isAccessibleForFree: true,
              image: `https://idir.ai/${locale}/opengraph-image`,
            }),
          }}
        />
      )}
    </>
  );
}
