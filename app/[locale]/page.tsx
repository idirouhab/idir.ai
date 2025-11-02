import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveEvent from "@/components/LiveEvent";
import About from "@/components/About";
import Speaking from "@/components/Speaking";
import Podcast from "@/components/Podcast";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import {getTranslations} from 'next-intl/server';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

type Props = {
  params: { locale: string };
};

export default async function Home({ params: { locale } }: Props) {
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
      <Navigation />
      <main>
        <Hero />
        <LiveEvent locale={locale} />
        <About />
        <Speaking />
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
            name: "Idir Ouhabmeskine",
            url: `https://idir.ai/${locale}`,
            jobTitle: t('jobTitle'),
            worksFor: {
              "@type": "Organization",
              name: "n8n",
              url: "https://n8n.io",
            },
            knowsAbout,
            sameAs: [
              "https://linkedin.com/in/idir-ouhabmeskine",
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
            inLanguage: locale,
            author: {
              "@type": "Person",
              name: "Idir Ouhabmeskine",
            },
            genre: podcastGenre,
          }),
        }}
      />
    </>
  );
}
