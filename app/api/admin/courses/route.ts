import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, canPublish } from '@/lib/auth';
import { getAdminCourseClient, CourseInput, getAllCourses } from '@/lib/courses';

// Get all courses (including drafts) - Admin only
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const courses = await getAllCourses(limit);

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/admin/courses:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new course - Admin only
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request);

    const body: CourseInput = await request.json();

    // ROLE-BASED PERMISSION: Only owners and admins can publish
    if (!canPublish(user)) {
      // Force status to draft for non-publishers
      body.status = 'draft';
      body.published_at = null;
    } else {
      // Owners and admins can publish directly
      if (body.status === 'published' && !body.published_at) {
        body.published_at = new Date().toISOString();
      }
    }

    // Set default values
    const courseData = {
      ...body,
      tags: body.tags || [],
      course_type: body.course_type || 'free',
      author_id: user.userId,
      author_name: user.email,
    };

    const supabase = getAdminCourseClient();
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/courses:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
