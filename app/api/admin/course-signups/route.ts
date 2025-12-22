import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase
      .from('course_signups')
      .select(`
        id,
        signup_status,
        language,
        created_at,
        updated_at,
        completed_at,
        certificate_id,
        certificate_url,
        student_id,
        students (
          email,
          first_name,
          last_name,
          country,
          birth_year
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching course signups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch signups' },
        { status: 500 }
      );
    }

    // Transform data to include student info at top level
    const signups = (data || []).map((signup: any) => ({
      ...signup,
      email: signup.students?.email || 'No email',
      first_name: signup.students?.first_name || 'N/A',
      last_name: signup.students?.last_name || '',
      country: signup.students?.country || null,
      birth_year: signup.students?.birth_year || null,
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
