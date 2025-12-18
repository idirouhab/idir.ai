import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import { saveCertificateToStorage } from '@/lib/certificate-storage';
import { randomUUID } from 'crypto';

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

    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const { id } = await params;

    // Fetch signup record
    const { data: signup, error: fetchError } = await supabaseAdmin
      .from('course_signups')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !signup) {
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
    const { data: updatedSignup, error: updateError } = await supabaseAdmin
      .from('course_signups')
      .update({
        completed_at: new Date().toISOString(),
        certificate_id: certificateId,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating signup:', updateError);
      return NextResponse.json(
        { error: 'Failed to mark as complete' },
        { status: 500 }
      );
    }

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
    const { data: finalSignup, error: finalUpdateError } = await supabaseAdmin
      .from('course_signups')
      .update({
        certificate_url: storageResult.url,
      })
      .eq('id', id)
      .select()
      .single();

    if (finalUpdateError) {
      console.error('Error updating certificate URL:', finalUpdateError);
      // Not a critical error - certificate is generated but URL not saved
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
