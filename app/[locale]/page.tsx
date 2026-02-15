import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import {getTranslations} from 'next-intl/server';
import TrustedExperience from '@/components/TrustedExperience';
import Services from '@/components/Services';
import Speaking from '@/components/Speaking';
import Results from '@/components/Results';
import Process from '@/components/Process';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

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
  const [t, tAria, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'structuredData' }),
    getTranslations({ locale, namespace: 'aria' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

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
        {tAria('skipToMain')}
      </a>

      <Navigation />
      <main id="main-content" role="main">
        <Hero />
        <TrustedExperience />
        <Services />
        <Results />
        <Process />
        <Speaking />
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
            "@id": "https://idir.ai/#person",
            name: "Idir Ouhab Meskine",
            url: `https://idir.ai/${locale}`,
            jobTitle: t('jobTitle'),
            worksFor: {
              "@type": "Organization",
              "@id": "https://n8n.io/#organization",
              name: "n8n",
              url: "https://n8n.io",
            },
            knowsAbout: knowsAbout,
            sameAs: [
              "https://www.linkedin.com/in/idirouhab/",
              "https://x.com/idir_ouhab",
              "https://github.com/idirouhab",
              "https://youtube.com/@Prompt_and_Pay",
            ],
            alumniOf: [
              {
                "@type": "Organization",
                name: "GitLab",
                url: "https://gitlab.com",
              },
              {
                "@type": "Organization",
                name: "Platzi",
                url: "https://platzi.com",
              },
            ],
            description: t('description'),
            contactPoint: {
              "@type": "ContactPoint",
              email: "contact@idir.ai",
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
            "@id": "https://idir.ai/#profilepage",
            mainEntity: {
              "@id": "https://idir.ai/#person",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: tCommon('home'),
                  item: `https://idir.ai/${locale}`,
                },
              ],
            },
          }),
        }}
      />
    </>
  );
}
