/**
 * POST /api/certificates/:certificateId/revoke
 *
 * Revokes a certificate with a reason
 *
 * Supports localization via:
 * - Query parameter: ?lang=es or ?locale=es
 * - Accept-Language header
 */

import { NextRequest, NextResponse } from 'next/server';
import { revokeCertificate } from '@/lib/certificates';
import { createTranslator } from '@/lib/certificate-i18n';
import { z } from 'zod';

const RevokeRequestSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  actor_id: z.string().uuid().optional(),
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
          error: t('revoke.error.invalidFormat'),
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = RevokeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: t('revoke.error.invalidBody'),
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { reason, actor_id } = validationResult.data;

    // Revoke certificate
    const result = await revokeCertificate(certificateId, reason, actor_id);

    if (!result.success) {
      // Map error messages to translations
      let errorKey = 'revoke.error.internal';
      if (result.error?.includes('not found')) {
        errorKey = 'revoke.error.notFound';
      } else if (result.error?.includes('already revoked')) {
        errorKey = 'revoke.error.alreadyRevoked';
      }

      return NextResponse.json(
        {
          success: false,
          error: t(errorKey),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: t('revoke.success'),
      certificate_id: certificateId,
    });
  } catch (error) {
    console.error('[API] Certificate revoke error:', error);
    return NextResponse.json(
      {
        success: false,
        error: t('revoke.error.internal'),
      },
      { status: 500 }
    );
  }
}
