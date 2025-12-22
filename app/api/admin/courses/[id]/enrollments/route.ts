import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET enrollments for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await checkAuth(request);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: courseId } = await params;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Join with students table to get student information
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

    if (error) throw error;

    // Transform data to match the expected frontend format
    const enrollments = (data || []).map((signup: any) => ({
      id: signup.id,
      first_name: signup.students?.first_name || 'N/A',
      last_name: signup.students?.last_name || '',
      email: signup.students?.email || 'No email',
      country: signup.students?.country || null,
      birth_year: signup.students?.birth_year || null,
      signup_status: signup.signup_status,
      language: signup.language,
      created_at: signup.created_at,
    }));

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
