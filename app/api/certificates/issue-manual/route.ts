/**
 * POST /api/certificates/issue-manual
 *
 * Issues a manual/external certificate without requiring course_signup_id
 * For students who completed courses via third-party platforms
 *
 * Supports localization via:
 * - Query parameter: ?lang=es or ?locale=es
 * - Accept-Language header
 *
 * Body parameters:
 * - student_full_name (required): Student's full name
 * - student_email (required): Student's email
 * - course_title (required): Course title
 * - completed_at (required): Completion date (ISO string or YYYY-MM-DD)
 * - course_id (optional): Custom course identifier (e.g., "ACME-AUTO-101")
 * - issued_at (optional): Issue date (defaults to now)
 * - actor_email (optional): Email of person issuing certificate
 * - segments (optional): Array of strings for certificate ID generation
 * - pdf_url (optional): URL to PDF certificate (e.g., Cloudflare R2)
 * - jpg_url (optional): URL to JPG certificate (e.g., Cloudflare R2)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { issueManualCertificate } from '@/scripts/issue-manual-certificate';
import { z } from 'zod';

const ManualCertificateSchema = z.object({
  student_full_name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  student_email: z.string().email('Invalid email format'),
  course_title: z.string().min(2, 'Course title must be at least 2 characters').max(500),
  completed_at: z.string().refine((val) => {
    // Accept ISO date or YYYY-MM-DD format
    return !isNaN(Date.parse(val));
  }, 'Invalid date format'),
  course_id: z.string().optional(),
  issued_at: z.string().optional(),
  actor_email: z.string().email().optional(),
  segments: z.array(z.string()).optional(),
  pdf_url: z.string().url('Invalid PDF URL format').optional(),
  jpg_url: z.string().url('Invalid JPG URL format').optional(),
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

export async function POST(request: NextRequest) {
  const locale = detectLocale(request);
  const t = await getTranslations({ locale, namespace: 'certificates.issue' });

  try {
    // Parse and validate request body
    const body = await request.json();
    console.log(body)
    const validationResult = ManualCertificateSchema.safeParse(body);
      console.log(validationResult)
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

    const data = validationResult.data;

    // Issue manual certificate
    const result = await issueManualCertificate({
      student_full_name: data.student_full_name,
      student_email: data.student_email,
      course_title: data.course_title,
      completed_at: data.completed_at,
      course_id: data.course_id,
      issued_at: data.issued_at,
      actor_email: data.actor_email,
      segments: data.segments,
      pdf_url: data.pdf_url,
      jpg_url: data.jpg_url,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || t('errorInternal'),
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: t('success'),
        certificate_id: result.certificate_id,
        payload_hash: result.payload_hash,
        verification_url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${result.verification_url}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Manual certificate issue error:', error);
    return NextResponse.json(
      {
        success: false,
        error: t('errorInternal'),
      },
      { status: 500 }
    );
  }
}
