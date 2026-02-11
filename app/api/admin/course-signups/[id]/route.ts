import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/app-roles';
import { query } from '@/lib/db';

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
    const result = await query(
      `UPDATE course_signups
       SET signup_status = $1
       WHERE id = $2
       RETURNING *`,
      [signup_status, id]
    );
    const data = result.rows[0];

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
    if (!isAdmin(authResult.user?.roles)) {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and billing admins can delete signups' },
        { status: 403 }
      );
    }
    await query(`DELETE FROM course_signups WHERE id = $1`, [id]);

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
