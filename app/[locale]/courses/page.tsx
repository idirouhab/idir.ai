import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getPublishedCourses } from '@/lib/courses';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export const revalidate = 1800; // 30 minutes

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  const courses = await getPublishedCourses(locale as 'en' | 'es');
  const t = await getTranslations('courses');

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Navigation />
      <main id="main-content" role="main" className="min-h-screen bg-black">
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-16">
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
                {t('title', { defaultValue: 'Cursos' })}
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl">
                {t('subtitle', { defaultValue: 'Aprende automatización, IA y tecnología con cursos prácticos diseñados para llevarte del concepto a la implementación.' })}
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => {
                  const logistics = course.course_data?.logistics;
                  const pricing = course.course_data?.pricing;
                  const instructors = course.course_data?.instructors;

                  return (
                    <Link
                      key={course.id}
                      href={`/${locale}/courses/${course.slug}`}
                      className="group relative bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                    >
                      {/* Course Image/Cover - Desktop only */}
                      {course.cover_image && (
                        <div className="hidden md:block mb-6 rounded-xl overflow-hidden">
                          <img
                            src={course.cover_image}
                            alt={course.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Badge */}
                      {pricing?.isFree && (
                        <div className="inline-block mb-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full">
                          {t('free', { defaultValue: 'Gratis' })}
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                        {course.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-gray-400 mb-6 line-clamp-3">
                        {course.short_description}
                      </p>

                      {/* Course Meta */}
                      <div className="space-y-2 mb-6">
                        {logistics?.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{logistics.duration}</span>
                          </div>
                        )}
                        {logistics?.startDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{logistics.startDate}</span>
                          </div>
                        )}
                        {instructors && instructors.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{instructors[0].name}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <span className="text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
                          {t('viewCourse', { defaultValue: 'Ver curso' })}
                        </span>
                        <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
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
