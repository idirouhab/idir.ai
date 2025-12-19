import { getPublishedCourseBySlug, incrementCourseViews } from '@/lib/courses';
import { notFound } from 'next/navigation';
import DynamicCoursePage from '@/components/courses/DynamicCoursePage';

export default async function CoursePage({
  params,
}: {
  params: { locale: 'en' | 'es'; slug: string };
}) {
  const locale = await Promise.resolve(params.locale);
  const slug = await Promise.resolve(params.slug);

  const course = await getPublishedCourseBySlug(slug, locale);

  if (!course) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementCourseViews(course.id).catch(console.error);

  return <DynamicCoursePage course={course} locale={locale} />;
}

// Generate static params for all published courses
export async function generateStaticParams() {
  const { getPublishedCourses } = await import('@/lib/courses');

  const enCourses = await getPublishedCourses('en');
  const esCourses = await getPublishedCourses('es');

  return [
    ...enCourses.map((course) => ({
      locale: 'en',
      slug: course.slug,
    })),
    ...esCourses.map((course) => ({
      locale: 'es',
      slug: course.slug,
    })),
  ];
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { locale: 'en' | 'es'; slug: string };
}) {
  const locale = await Promise.resolve(params.locale);
  const slug = await Promise.resolve(params.slug);

  const course = await getPublishedCourseBySlug(slug, locale);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: course.meta_title || `${course.title} | idir.ai`,
    description: course.meta_description || course.short_description,
  };
}
