import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import {getTranslations} from 'next-intl/server';
import dynamic from 'next/dynamic';

// PERFORMANCE: Lazy load below-the-fold components (not visible on initial load)
// This reduces initial JavaScript bundle and improves Time to Interactive
const About = dynamic(() => import('@/components/About'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Services = dynamic(() => import('@/components/Services'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Courses = dynamic(() => import('@/components/Courses'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Podcast = dynamic(() => import('@/components/Podcast'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Contact = dynamic(() => import('@/components/Contact'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div className="min-h-[200px]" />,
});

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

// PERFORMANCE: ISR - Revalidate every 30 minutes to keep content fresh
// Pages are served instantly from cache, then regenerated in the background
export const revalidate = 1800; // 30 minutes in seconds

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'structuredData' });

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
      {/* Skip to content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Navigation />
      <main id="main-content" role="main">
        <Hero />
        <About />
        <Services />
        <Courses locale={locale as 'en' | 'es'} />
        <Podcast />
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
    </>
  );
}
