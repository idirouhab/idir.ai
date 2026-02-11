import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { saveCertificateToStorage } from '@/lib/certificate-storage';
import { randomUUID } from 'crypto';
import { query } from '@/lib/db';

/**
 * Mark course signup as complete and generate certificate
 * POST /api/admin/course-signups/[id]/complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { id } = await params;

    // Fetch signup record with student information
    const signupResult = await query(
      `SELECT cs.*, s.email, s.first_name, s.last_name
       FROM course_signups cs
       LEFT JOIN students s ON s.id = cs.student_id
       WHERE cs.id = $1
       LIMIT 1`,
      [id]
    );
    const signup = signupResult.rows[0];

    if (!signup) {
      return NextResponse.json(
        { error: 'Signup not found' },
        { status: 404 }
      );
    }

    // Check if already completed (idempotent)
    if (signup.completed_at && signup.certificate_id) {
      return NextResponse.json({
        success: true,
        message: 'Signup already completed',
        signup,
        certificateUrl: signup.certificate_url,
      });
    }

    // Generate certificate ID
    const certificateId = randomUUID();

    // Update database with completion info
    const updatedResult = await query(
      `UPDATE course_signups
       SET completed_at = $1, certificate_id = $2
       WHERE id = $3
       RETURNING *`,
      [new Date().toISOString(), certificateId, id]
    );
    const updatedSignup = updatedResult.rows[0];

    // Generate certificate image by calling internal endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;
    const certificateImageUrl = `${baseUrl}/api/certificates/${certificateId}/image`;

    const imageResponse = await fetch(certificateImageUrl);

    if (!imageResponse.ok) {
      console.error('Failed to generate certificate image');
      return NextResponse.json(
        { error: 'Failed to generate certificate image' },
        { status: 500 }
      );
    }

    // Convert response to buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload certificate to Supabase storage
    const storageResult = await saveCertificateToStorage(certificateId, imageBuffer);

    if (!storageResult.success) {
      console.error('Failed to save certificate to storage:', storageResult.error);
      return NextResponse.json(
        { error: 'Failed to save certificate' },
        { status: 500 }
      );
    }

    // Update certificate_url in database
    let finalSignup = updatedSignup;
    try {
      const finalResult = await query(
        `UPDATE course_signups
         SET certificate_url = $1
         WHERE id = $2
         RETURNING *`,
        [storageResult.url, id]
      );
      finalSignup = finalResult.rows[0] || updatedSignup;
    } catch (finalUpdateError) {
      console.error('Error updating certificate URL:', finalUpdateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Course marked as complete and certificate generated',
      signup: finalSignup || updatedSignup,
      certificateUrl: storageResult.url,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/course-signups/[id]/complete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
