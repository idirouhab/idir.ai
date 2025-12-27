import { getPublishedCourseBySlug, incrementCourseViews } from '@/lib/courses';
import { notFound, redirect } from 'next/navigation';
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

  try {
    const course = await getPublishedCourseBySlug(slug, locale);

    if (!course) {
      notFound();
    }

    // Redirect if course language doesn't match the URL locale
    // This handles cases where someone types the URL directly or follows an old link
    if (course.language !== locale) {
      redirect(`/${course.language}/courses/${course.slug}`);
    }

    // Increment view count (fire and forget)
    incrementCourseViews(course.id).catch((error) => {
      console.error('Error incrementing views:', error);
    });

    return <DynamicCoursePage course={course} locale={locale} />;
  } catch (error) {
    console.error('Error loading course page:', error);
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

  const course = await getPublishedCourseBySlug(slug, locale);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

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
}
