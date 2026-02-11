import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { saveCertificateToStorage, deleteCertificate } from '@/lib/certificate-storage';
import { query } from '@/lib/db';

/**
 * Regenerate certificate (useful if design changes or error occurred)
 * POST /api/admin/certificates/[certificateId]/regenerate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { certificateId } = await params;

    // Fetch signup by certificate_id
    const signupResult = await query(
      `SELECT * FROM course_signups WHERE certificate_id = $1 LIMIT 1`,
      [certificateId]
    );
    const signup = signupResult.rows[0];

    if (!signup) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Delete old certificate from storage if it exists
    if (signup.certificate_url) {
      const deleteResult = await deleteCertificate(signup.certificate_url);
      if (!deleteResult.success) {
        console.warn('Failed to delete old certificate:', deleteResult.error);
        // Continue anyway - not critical
      }
    }

    // Generate new certificate image
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

    // Upload new certificate to Supabase storage
    const storageResult = await saveCertificateToStorage(certificateId, imageBuffer);

    if (!storageResult.success) {
      console.error('Failed to save certificate to storage:', storageResult.error);
      return NextResponse.json(
        { error: 'Failed to save certificate' },
        { status: 500 }
      );
    }

    // Update certificate_url in database
    const updateResult = await query(
      `UPDATE course_signups
       SET certificate_url = $1
       WHERE certificate_id = $2
       RETURNING *`,
      [storageResult.url, certificateId]
    );
    const updatedSignup = updateResult.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Certificate regenerated successfully',
      signup: updatedSignup,
      certificateUrl: storageResult.url,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/certificates/[certificateId]/regenerate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
