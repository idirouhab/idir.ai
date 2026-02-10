import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Podcast from '@/components/Podcast';
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'podcast' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `https://idir.ai/${locale}/podcast`,
      languages: {
        en: 'https://idir.ai/en/podcast',
        es: 'https://idir.ai/es/podcast',
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `https://idir.ai/${locale}/podcast`,
      siteName: 'Idir Ouhab Meskine',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function PodcastPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'podcast' });

  const topics = [
    t('topics.0'),
    t('topics.1'),
    t('topics.2'),
    t('topics.3'),
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black text-white">
        <section className="section-pad pt-32 md:pt-36">
          <div className="section-container space-y-10">
            <div className="card-surface">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-10 bg-[#11b981]" />
                <span className="section-kicker">{t('label')}</span>
              </div>
              <h1 className="section-title text-white mb-4">
                {t('title')}
              </h1>
              <p className="section-subtitle max-w-2xl">
                {t('description')}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="uppercase tracking-wider text-[#11b981] font-semibold">
                  {t('status')}
                </span>
                <span className="text-gray-700">•</span>
                <Link
                  href={`/${locale}/subscribe`}
                  className="text-white hover:text-[#11b981] transition-colors"
                >
                  {t('subscribeCta')}
                </Link>
              </div>
            </div>

            <div className="card-surface">
              <Podcast showHeader={false} />
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div className="card-surface">
                <h2 className="text-xl font-bold text-white mb-4">
                  {t('topicsLabel')}
                </h2>
                <ul className="space-y-3 text-gray-300">
                  {topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#11b981]" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-surface">
                <h3 className="text-xl font-bold text-white mb-3">
                  {t('aboutTitle')}
                </h3>
                <p className="text-gray-300 text-sm">{t('description')}</p>
                <div className="mt-6">
                  <Link
                    href={`/${locale}/subscribe`}
                    className="inline-flex items-center justify-center px-5 py-3 bg-[#11b981] text-black font-bold rounded hover:bg-[#0f9f73] transition-colors"
                  >
                    {t('subscribeCta')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* JSON-LD PodcastSeries Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PodcastSeries",
            name: "Prompt&Play",
            description: t('description'),
            inLanguage: "es",
            author: {
              "@type": "Person",
              name: "Idir Ouhab Meskine",
            },
            genre: topics,
            url: "https://idir.ai/podcast",
          }),
        }}
      />
    </>
  );
}
