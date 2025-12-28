import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `https://idir.ai/${locale}/faq`,
      languages: {
        'en': 'https://idir.ai/en/faq',
        'es': 'https://idir.ai/es/faq',
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `https://idir.ai/${locale}/faq`,
      siteName: 'Idir Ouhab Meskine',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  const faqs = [
    {
      question: t('questions.0.question'),
      answer: t('questions.0.answer'),
    },
    {
      question: t('questions.1.question'),
      answer: t('questions.1.answer'),
    },
    {
      question: t('questions.2.question'),
      answer: t('questions.2.answer'),
    },
    {
      question: t('questions.3.question'),
      answer: t('questions.3.answer'),
    },
    {
      question: t('questions.4.question'),
      answer: t('questions.4.answer'),
    },
    {
      question: t('questions.5.question'),
      answer: t('questions.5.answer'),
    },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 border-b border-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-emerald-500/30 transition-colors"
                >
                  <summary className="flex items-start justify-between cursor-pointer list-none">
                    <h2 className="text-xl font-bold text-white pr-8 group-open:text-emerald-400">
                      {faq.question}
                    </h2>
                    <ChevronDown className="w-6 h-6 text-emerald-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('cta.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('cta.description')}
              </p>
              <a
                href={`/${locale}#contact`}
                className="inline-block px-6 py-3 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-600 transition-colors"
              >
                {t('cta.button')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* JSON-LD FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `https://idir.ai/${locale}/faq#faqpage`,
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
