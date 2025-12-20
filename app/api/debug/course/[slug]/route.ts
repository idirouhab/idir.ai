import { NextRequest, NextResponse } from 'next/server';
import { getPublishedCourseBySlug } from '@/lib/courses';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get('locale') || 'es') as 'en' | 'es';

  try {
    console.log('Debug: Fetching course:', slug, 'locale:', locale);

    const course = await getPublishedCourseBySlug(slug, locale);

    if (!course) {
      return NextResponse.json({
        error: 'Course not found',
        slug,
        locale
      }, { status: 404 });
    }

    // Return sanitized course data for debugging
    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        language: course.language,
        status: course.status,
        has_course_data: !!course.course_data,
        course_data_keys: course.course_data ? Object.keys(course.course_data) : [],
        hero_title: course.course_data?.hero?.title,
        has_instructors: !!(course.course_data?.instructors && course.course_data.instructors.length > 0),
        instructor_count: course.course_data?.instructors?.length || 0,
      }
    });
  } catch (error: any) {
    console.error('Debug: Error fetching course:', error);
    return NextResponse.json({
      error: 'Error fetching course',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      slug,
      locale
    }, { status: 500 });
  }
}
