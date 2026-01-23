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
import { getTranslations } from 'next-intl/server';
import { revokeCertificate } from '@/lib/certificates';
import { isValidCertificateId } from '@/lib/certificate-id';
import { z } from 'zod';

const RevokeRequestSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  actor_id: z.string().uuid().optional(),
});

function detectLocale(request: NextRequest): 'en' | 'es' {
  const url = new URL(request.url);
  const langParam = url.searchParams.get('lang') || url.searchParams.get('locale');
  if (langParam === 'es' || langParam === 'español' || langParam === 'spanish') return 'es';
  if (langParam === 'en' || langParam === 'english' || langParam === 'inglés') return 'en';
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.toLowerCase().includes('es')) return 'es';
  return 'en';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const locale = detectLocale(request);
  const t = await getTranslations({ locale, namespace: 'certificates.revoke' });

  try {
    const { certificateId } = await params;

    // Validate certificate_id format (supports both legacy and new formats)
    if (!isValidCertificateId(certificateId)) {
      return NextResponse.json(
        {
          success: false,
          error: t('errorInvalidFormat'),
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
          error: t('errorInvalidBody'),
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
      let errorKey = 'errorInternal';
      if (result.error?.includes('not found')) {
        errorKey = 'errorNotFound';
      } else if (result.error?.includes('already revoked')) {
        errorKey = 'errorAlreadyRevoked';
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
      message: t('success'),
      certificate_id: certificateId,
    });
  } catch (error) {
    console.error('[API] Certificate revoke error:', error);
    return NextResponse.json(
      {
        success: false,
        error: t('errorInternal'),
      },
      { status: 500 }
    );
  }
}
