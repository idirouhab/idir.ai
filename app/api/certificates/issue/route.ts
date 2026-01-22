/**
 * POST /api/certificates/issue
 *
 * Issues a certificate for a completed course signup
 * Idempotent: Returns existing valid certificate if one exists
 *
 * Supports localization via:
 * - Query parameter: ?lang=es or ?locale=es
 * - Accept-Language header
 */

import { NextRequest, NextResponse } from 'next/server';
import { issueCertificate } from '@/lib/certificates';
import { createTranslator } from '@/lib/certificate-i18n';
import { z } from 'zod';

const IssueRequestSchema = z.object({
  course_signup_id: z.string().uuid('Invalid course_signup_id format'),
  actor_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  const { t } = createTranslator(request);

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = IssueRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: t('issue.error.invalidBody'),
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { course_signup_id, actor_id } = validationResult.data;

    // Issue certificate
    const result = await issueCertificate(course_signup_id, actor_id);

    if (!result.success) {
      // Map error messages to translations
      let errorKey = 'issue.error.internal';
      if (result.error?.includes('not found')) {
        errorKey = 'issue.error.notFound';
      } else if (result.error?.includes('not completed')) {
        errorKey = 'issue.error.notCompleted';
      }

      return NextResponse.json(
        {
          success: false,
          error: t(errorKey),
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: t('issue.success'),
        certificate_id: result.certificate?.certificate_id,
        status: result.certificate?.status,
        issued_at: result.certificate?.issued_at,
        payload_hash: result.certificate?.payload_hash,
        verification_url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${result.verification_url}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Certificate issue error:', error);
    return NextResponse.json(
      {
        success: false,
        error: t('issue.error.internal'),
      },
      { status: 500 }
    );
  }
}
