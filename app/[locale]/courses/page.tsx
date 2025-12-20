import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";

import { getAllPublishedCourses } from '@/lib/courses';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

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

            {/* Courses Grid */}
            {courses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">
                  No hay cursos disponibles en este momento.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {courses.map((course) => {
                  const logistics = course.course_data?.logistics;
                  const pricing = course.course_data?.pricing;
                  const instructors = course.course_data?.instructors;

                  return (
                    <Link
                      key={course.id}
                      href={`/${locale}/courses/${course.slug}`}
                      className="group relative bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                    >
                      {/* Course Image/Cover - Desktop only */}
                      {course.cover_image && (
                        <div className="hidden md:block mb-6 rounded-xl overflow-hidden">
                          <Image
                            src={course.cover_image}
                            alt={course.title}
                            width={400}
                            height={192}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {/* Language Badge */}
                        <div className="inline-block px-2 md:px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                          {course.language.toUpperCase()}
                        </div>

                        {/* Free Badge */}
                        {pricing?.isFree && (
                          <div className="inline-block px-2 md:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full">
                            {t('free')}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3 group-hover:text-emerald-400 transition-colors">
                        {course.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6 line-clamp-3">
                        {course.short_description}
                      </p>

                      {/* Course Meta */}
                      <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                        {logistics?.duration && (
                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="truncate">{logistics.duration}</span>
                          </div>
                        )}
                        {logistics?.startDate && (
                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="truncate">{logistics.startDate}</span>
                          </div>
                        )}
                        {instructors && instructors.length > 0 && (
                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="truncate">{instructors[0].name}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-800">
                        <span className="text-sm md:text-base text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
                          {t('viewCourse')}
                        </span>
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
