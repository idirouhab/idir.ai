import { getPublishedCourseBySlugOnly, incrementCourseViews } from '@/lib/courses';
import { notFound } from 'next/navigation';
import DynamicCoursePage from '@/components/courses/DynamicCoursePage';

// Enable ISR - regenerate every 60 seconds
export const revalidate = 60;

// Allow dynamic params for courses created after build
export const dynamicParams = true;

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'es'; slug: string }>;
}) {
  const { locale, slug } = await params;

  console.log(`[CoursePage] Loading course: ${slug}, locale: ${locale}`);

  try {
    // Fetch course by slug only, ignoring locale to allow cross-language access
    const course = await getPublishedCourseBySlugOnly(slug);

    if (!course) {
      console.warn(`[CoursePage] Course not found: ${slug}`);
      notFound();
    }

    console.log(`[CoursePage] Course loaded successfully: ${course.id} - ${course.title}`);

    // Increment view count (fire and forget)
    incrementCourseViews(course.id).catch((error) => {
      console.error('[CoursePage] Error incrementing views:', {
        courseId: course.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    });

    return <DynamicCoursePage course={course} locale={locale} />;
  } catch (error) {
    console.error('[CoursePage] Error loading course page:', {
      slug,
      locale,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    throw error;
  }
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
  params: Promise<{ locale: 'en' | 'es'; slug: string }>;
}) {
  const { locale, slug } = await params;

  console.log(`[generateMetadata] Generating metadata for course: ${slug}, locale: ${locale}`);

  try {
    const course = await getPublishedCourseBySlugOnly(slug);

    if (!course) {
      console.warn(`[generateMetadata] Course not found: ${slug}`);
      return {
        title: 'Course Not Found',
      };
    }

    console.log(`[generateMetadata] Metadata generated successfully for: ${course.id} - ${course.title}`);

    const title = course.meta_title || `${course.title} | Idir Ouhab Meskine`;
    const description = course.meta_description || course.short_description;
    const url = `https://idir.ai/${locale}/courses/${slug}`;
    const image = course.cover_image || 'https://idir.ai/og-image.png';

    return {
      title,
      description,
      keywords: course.course_data?.hero?.badge ? [course.course_data.hero.badge, 'automation', 'AI', 'course', 'technology'] : ['automation', 'AI', 'course', 'technology'],
      authors: [{ name: 'Idir Ouhab Meskine' }],
      alternates: {
        canonical: url,
        languages: {
          en: `https://idir.ai/en/courses/${slug}`,
          es: `https://idir.ai/es/courses/${slug}`,
        },
      },
      openGraph: {
        title,
        description,
        url,
        siteName: 'Idir Ouhab Meskine',
        locale: locale === 'es' ? 'es_ES' : 'en_US',
        type: 'website',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: course.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        creator: '@idir',
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
  } catch (error) {
    console.error('[generateMetadata] Error generating metadata:', {
      slug,
      locale,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    // Return a fallback metadata instead of throwing
    return {
      title: 'Course | Idir Ouhab Meskine',
      description: 'Learn automation and AI with hands-on courses',
    };
  }
}
