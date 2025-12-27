'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Course } from '@/lib/courses';

type Props = {
  courses: Course[];
  locale: 'en' | 'es';
  translations: {
    free: string;
    viewCourse: string;
    allLanguages: string;
    english: string;
    spanish: string;
    noCoursesFound: string;
  };
};

export default function CoursesWithFilter({ courses, locale, translations }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'es'>('all');

  // Smart filtering: English speakers see only English, Spanish speakers see both
  const getAvailableCourses = () => {
    if (locale === 'en') {
      // English speakers: only show English courses
      return courses.filter(course => course.language === 'en');
    }
    // Spanish speakers: show both Spanish and English courses
    return courses;
  };

  const availableCourses = getAvailableCourses();

  // Filter courses based on selected language
  const filteredCourses = selectedLanguage === 'all'
    ? availableCourses
    : availableCourses.filter(course => course.language === selectedLanguage);

  return (
    <>
      {/* Language Filter */}
      <div className="mb-8 md:mb-12">
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              selectedLanguage === 'all'
                ? 'bg-emerald-500 text-black'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-emerald-500/50'
            }`}
          >
            {translations.allLanguages}
          </button>
          <button
            onClick={() => setSelectedLanguage('en')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              selectedLanguage === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-blue-500/50'
            }`}
          >
            {translations.english}
          </button>
          <button
            onClick={() => setSelectedLanguage('es')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              selectedLanguage === 'es'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-blue-500/50'
            }`}
          >
            {translations.spanish}
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-base md:text-lg">
            {translations.noCoursesFound}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredCourses.map((course) => {
            const logistics = course.course_data?.logistics;
            const pricing = course.course_data?.pricing;
            // Use relational instructors from course_instructors table
            const instructors = course.instructors && course.instructors.length > 0
              ? course.instructors.map(ci => ({
                  name: `${ci.instructor.first_name} ${ci.instructor.last_name}`,
                  // Priority: instructor's title > course-specific role > system role
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
                      {translations.free}
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
                    {translations.viewCourse}
                  </span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
