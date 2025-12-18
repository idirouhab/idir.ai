import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, canPublish } from '@/lib/auth';
import { getAdminCourseClient, CourseInput, getCourseById } from '@/lib/courses';

// Get a single course by ID - Admin only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    await requireAuth(request);

    const { id } = await params;
    const course = await getCourseById(id);

    return NextResponse.json(course, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/admin/courses/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a course - Admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await requireAuth(request);

    const { id } = await params;
    const body: Partial<CourseInput> = await request.json();

    // ROLE-BASED PERMISSION: Only owners and admins can publish
    if (!canPublish(user)) {
      // Force status to draft for non-publishers
      if (body.status === 'published') {
        body.status = 'draft';
        body.published_at = null;
      }
    } else {
      // Owners and admins can publish directly
      if (body.status === 'published' && !body.published_at) {
        // Only set published_at if it wasn't already set
        const existingCourse = await getCourseById(id);
        if (existingCourse.status !== 'published') {
          body.published_at = new Date().toISOString();
        }
      } else if (body.status === 'draft') {
        // If changing from published to draft, clear published_at
        body.published_at = null;
      }
    }

    const supabase = getAdminCourseClient();
    const { data, error } = await supabase
      .from('courses')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/courses/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a course - Admin only (owner role required)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await requireAuth(request);

    // Only owners can delete courses
    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can delete courses' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const supabase = getAdminCourseClient();
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/courses/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
