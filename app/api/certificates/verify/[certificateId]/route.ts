/**
 * GET /api/certificates/verify/:certificateId
 *
 * Public endpoint for certificate verification
 * Does NOT expose student email (privacy-preserving)
 * Increments verification counter and logs audit trail
 *
 * Supports localization via:
 * - Query parameter: ?lang=es or ?locale=es
 * - Accept-Language header
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCertificate } from '@/lib/certificates';
import { createTranslator } from '@/lib/certificate-i18n';

export async function GET(
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
          found: false,
          error: t('verify.invalidFormat'),
          message: t('verify.formatHint'),
        },
        { status: 400 }
      );
    }

    // Extract IP address and user agent for audit logging
    const ip_address = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    // Verify certificate
    const result = await verifyCertificate(certificateId, ip_address, user_agent);

    if (!result) {
      return NextResponse.json(
        {
          found: false,
          certificate_id: certificateId,
          message: t('verify.notFound'),
        },
        { status: 404 }
      );
    }

    // Determine message based on status
    let statusMessage: string;
    if (result.status === 'valid') {
      statusMessage = t('verify.valid');
    } else if (result.status === 'revoked') {
      statusMessage = t('verify.revoked');
    } else {
      statusMessage = t('verify.reissued');
    }

    // Return public verification data
    return NextResponse.json({
      found: true,
      certificate_id: result.certificate_id,
      status: result.status,
      student_name: result.student_name,
      course_title: result.course_title,
      issued_at: result.issued_at,
      completed_at: result.completed_at,
      ...(result.status === 'revoked' && {
        revoked_at: result.revoked_at,
        revoked_reason: result.revoked_reason,
      }),
      message: statusMessage,
    });
  } catch (error) {
    console.error('[API] Certificate verification error:', error);
    return NextResponse.json(
      {
        found: false,
        error: t('verify.error.internal'),
        message: t('verify.error.internal'),
      },
      { status: 500 }
    );
  }
}
