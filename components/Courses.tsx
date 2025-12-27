import { getAllPublishedCourses } from '@/lib/courses';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import Image from "next/image";

type CoursesProps = {
  locale: 'en' | 'es';
};

export default async function Courses({ locale }: CoursesProps) {
  const allCourses = await getAllPublishedCourses();
  const t = await getTranslations({ locale, namespace: 'courses' });

  // Smart filtering: English speakers see only English, Spanish speakers see both
  const courses = locale === 'en'
    ? allCourses.filter(course => course.language === 'en')
    : allCourses;

  if (courses.length === 0) {
    return null; // Don't show section if no courses
  }

  return (
    <section id="courses" className="py-12 md:py-24 px-4 md:px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
            {t('title')}
          </h2>
          <p className="text-base md:text-xl text-gray-400 max-w-3xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {courses.map((course) => {
            const logistics = course.course_data?.logistics;
            const pricing = course.course_data?.pricing;
            // Use relational instructors from course_instructors table
            const instructors = course.instructors && course.instructors.length > 0
              ? course.instructors.map(ci => ({
                  name: `${ci.instructor.first_name} ${ci.instructor.last_name}`,
                  title: ci.instructor.title || ci.instructor_role || ci.instructor.role,
                  bio: ci.instructor.description || '',
                  image: ci.instructor.picture_url,
                  linkedin: ci.instructor.linkedin_url,
                  twitter: ci.instructor.x_url,
                  website: ci.instructor.website_url,
                  youtube: ci.instructor.youtube_url,
                }))
              : [];

            return (
              <Link
                key={course.id}
                href={`/${course.language}/courses/${course.slug}`}
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
                  {instructors.length > 0 && (
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

        {/* View All Link (if needed in future) */}
        {courses.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors"
            >
              {t('viewAll')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
