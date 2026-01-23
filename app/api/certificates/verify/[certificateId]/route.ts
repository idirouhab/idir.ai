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
import { getTranslations } from 'next-intl/server';
import { verifyCertificate } from '@/lib/certificates';
import { isValidCertificateId } from '@/lib/certificate-id';

/**
 * Detect locale from request
 */
function detectLocale(request: NextRequest): 'en' | 'es' {
  // 1. Check query parameter (?lang=es or ?locale=es)
  const url = new URL(request.url);
  const langParam = url.searchParams.get('lang') || url.searchParams.get('locale');

  if (langParam === 'es' || langParam === 'español' || langParam === 'spanish') {
    return 'es';
  }

  if (langParam === 'en' || langParam === 'english' || langParam === 'inglés') {
    return 'en';
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.toLowerCase().includes('es')) {
    return 'es';
  }

  // 3. Default to English
  return 'en';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const locale = detectLocale(request);
  const t = await getTranslations({ locale, namespace: 'certificates.verify' });

  try {
    const { certificateId } = await params;

    // Validate certificate_id format (supports both legacy and new formats)
    if (!isValidCertificateId(certificateId)) {
      return NextResponse.json(
        {
          found: false,
          error: t('invalidFormat'),
          message: t('formatHint'),
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
          message: t('notFound'),
        },
        { status: 404 }
      );
    }

    // Determine message based on status
    let statusMessage: string;
    if (result.status === 'valid') {
      statusMessage = t('valid');
    } else if (result.status === 'revoked') {
      statusMessage = t('revoked');
    } else {
      statusMessage = t('reissued');
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
      pdf_url: result.pdf_url,
      jpg_url: result.jpg_url,
      message: statusMessage,
    });
  } catch (error) {
    console.error('[API] Certificate verification error:', error);
    return NextResponse.json(
      {
        found: false,
        error: t('errorInternal'),
        message: t('errorInternal'),
      },
      { status: 500 }
    );
  }
}
