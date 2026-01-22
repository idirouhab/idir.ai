/**
 * POST /api/certificates/:certificateId/reissue
 *
 * Re-issues a certificate (marks old as 'reissued', creates new one)
 * Optionally allows correcting the student name
 *
 * Supports localization via:
 * - Query parameter: ?lang=es or ?locale=es
 * - Accept-Language header
 */

import { NextRequest, NextResponse } from 'next/server';
import { reissueCertificate } from '@/lib/certificates';
import { createTranslator } from '@/lib/certificate-i18n';
import { z } from 'zod';

const ReissueRequestSchema = z.object({
  actor_id: z.string().uuid().optional(),
  updated_student_name: z.string().min(2).max(255).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const { t } = createTranslator(request);

  try {
    const { certificateId } = await params;

    // Validate certificate_id format
    const certIdPattern = /^CERT-\d{4}-[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/;
    if (!certIdPattern.test(certificateId)) {
      return NextResponse.json(
        {
          success: false,
          error: t('reissue.error.invalidFormat'),
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ReissueRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: t('reissue.error.invalidBody'),
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { actor_id, updated_student_name } = validationResult.data;

    // Reissue certificate
    const result = await reissueCertificate(
      certificateId,
      actor_id,
      updated_student_name
    );

    if (!result.success) {
      // Map error messages to translations
      let errorKey = 'reissue.error.internal';
      if (result.error?.includes('not found')) {
        errorKey = 'reissue.error.notFound';
      }

      return NextResponse.json(
        {
          success: false,
          error: t(errorKey),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: t('reissue.success'),
        old_certificate_id: certificateId,
        new_certificate_id: result.certificate?.certificate_id,
        status: result.certificate?.status,
        issued_at: result.certificate?.issued_at,
        payload_hash: result.certificate?.payload_hash,
        verification_url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${result.verification_url}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Certificate reissue error:', error);
    return NextResponse.json(
      {
        success: false,
        error: t('reissue.error.internal'),
      },
      { status: 500 }
    );
  }
}
