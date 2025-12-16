import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { supabase, supabaseAdmin } from '@/lib/supabase';

/**
 * Update course signup status
 * PATCH /api/admin/course-signups/[id]
 * Body: { signup_status: 'pending' | 'confirmed' | 'waitlist' | 'cancelled' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { signup_status } = body;

    if (!signup_status) {
      return NextResponse.json(
        { error: 'signup_status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'waitlist', 'cancelled'];
    if (!validStatuses.includes(signup_status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update the signup
    const { data, error } = await supabase
      .from('course_signups')
      .update({ signup_status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course signup:', error);
      return NextResponse.json(
        { error: 'Failed to update signup' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signup: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/course-signups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Delete a course signup
 * DELETE /api/admin/course-signups/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    // SECURITY: Only owners and admins can delete signups
    if (authResult.user?.role !== 'owner' && authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can delete signups' },
        { status: 403 }
      );
    }
    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Delete the signup using admin client (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('course_signups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course signup:', error);
      return NextResponse.json(
        { error: 'Failed to delete signup' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Signup deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/course-signups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
