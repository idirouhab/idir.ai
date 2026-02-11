import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { query } from '@/lib/db';

/**
 * Get all course signups
 * GET /api/admin/course-signups?course_id=<uuid>
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json(
        { error: 'course_id parameter is required' },
        { status: 400 }
      );
    }

    // Fetch signups from database with student information
    const result = await query(
      `SELECT
        cs.id,
        cs.signup_status,
        cs.language,
        cs.created_at,
        cs.updated_at,
        cs.completed_at,
        cs.certificate_id,
        cs.certificate_url,
        cs.student_id,
        s.email,
        s.first_name,
        s.last_name,
        s.country,
        s.birth_year
      FROM course_signups cs
      LEFT JOIN students s ON s.id = cs.student_id
      WHERE cs.course_id = $1
      ORDER BY cs.created_at DESC`,
      [courseId]
    );
    const data = result.rows;

    // Transform data to include student info at top level
    const signups = (data || []).map((signup: any) => ({
      ...signup,
      email: signup.email || 'No email',
      first_name: signup.first_name || 'N/A',
      last_name: signup.last_name || '',
      country: signup.country || null,
      birth_year: signup.birth_year || null,
    }));

    // Get summary stats
    const stats = {
      total: signups?.length || 0,
      confirmed: signups?.filter((s: any) => s.signup_status === 'confirmed').length || 0,
      pending: signups?.filter((s: any) => s.signup_status === 'pending').length || 0,
      waitlist: signups?.filter((s: any) => s.signup_status === 'waitlist').length || 0,
      completed: signups?.filter((s: any) => s.completed_at !== null).length || 0,
    };

    return NextResponse.json({
      success: true,
      signups,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/course-signups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
