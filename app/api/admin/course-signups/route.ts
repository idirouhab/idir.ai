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

    // Fetch signups from database
    const { data, error } = await supabase
      .from('course_signups')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching course signups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch signups' },
        { status: 500 }
      );
    }

    // Get summary stats
    const stats = {
      total: data?.length || 0,
      confirmed: data?.filter((s: any) => s.signup_status === 'confirmed').length || 0,
      pending: data?.filter((s: any) => s.signup_status === 'pending').length || 0,
      waitlist: data?.filter((s: any) => s.signup_status === 'waitlist').length || 0,
      completed: data?.filter((s: any) => s.completed_at !== null).length || 0,
    };

    return NextResponse.json({
      success: true,
      signups: data,
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
