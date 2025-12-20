import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getAllPublishedCourses } from '@/lib/courses';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import CoursesWithFilter from '@/components/courses/CoursesWithFilter';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export const revalidate = 1800; // 30 minutes

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'courses' });

  const title = t('title');
  const description = t('subtitle');
  const url = `https://idir.ai/${locale}/courses`;

  return {
    title: `${title} | Idir Ouhab Meskine`,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: 'https://idir.ai/en/courses',
        es: 'https://idir.ai/es/courses',
      },
    },
    openGraph: {
      title: `${title} | Idir Ouhab Meskine`,
      description,
      url,
      siteName: 'Idir Ouhab Meskine',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://idir.ai/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Idir Ouhab Meskine`,
      description,
      images: ['https://idir.ai/og-image.png'],
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

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  const courses = await getAllPublishedCourses();
  const t = await getTranslations({ locale, namespace: 'courses' });

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Navigation />
      <main id="main-content" role="main" className="min-h-screen bg-black">
        <section className="py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 md:mb-16">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6">
                {t('title')}
              </h1>
              <p className="text-base md:text-xl text-gray-400 max-w-3xl">
                {t('subtitle')}
              </p>
            </div>

            {/* Courses with Language Filter */}
            {courses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-base md:text-lg">
                  {t('noCoursesAvailable')}
                </p>
              </div>
            ) : (
              <CoursesWithFilter
                courses={courses}
                locale={locale}
                translations={{
                  free: t('free'),
                  viewCourse: t('viewCourse'),
                  allLanguages: t('filter.all'),
                  english: t('filter.english'),
                  spanish: t('filter.spanish'),
                  noCoursesFound: t('filter.noCoursesFound'),
                }}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
