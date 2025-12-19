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

// UPDATE enrollment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  const payload = await checkAuth(request);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { enrollmentId } = await params;
    const body = await request.json();
    const { signup_status } = body;

    if (!signup_status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('course_signups')
      .update({ signup_status })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ enrollment: data });
  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  const payload = await checkAuth(request);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { enrollmentId } = await params;
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('course_signups')
      .delete()
      .eq('id', enrollmentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
