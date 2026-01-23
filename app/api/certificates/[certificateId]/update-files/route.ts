/**
 * PATCH /api/certificates/:certificateId/update-files
 *
 * Updates the PDF and/or JPG URLs for an existing certificate
 * Useful for adding file URLs after certificate creation
 *
 * Supports localization via:
 * - Query parameter: ?lang=es or ?locale=es
 * - Accept-Language header
 *
 * Body parameters:
 * - pdf_url (optional): URL to PDF certificate in Cloudflare R2
 * - jpg_url (optional): URL to JPG certificate in Cloudflare R2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { getClient } from '@/lib/db';
import { isValidCertificateId } from '@/lib/certificate-id';
import { z } from 'zod';

const UpdateFilesSchema = z.object({
  pdf_url: z.string().url('Invalid PDF URL format').optional(),
  jpg_url: z.string().url('Invalid JPG URL format').optional(),
}).refine(
  (data) => data.pdf_url || data.jpg_url,
  'At least one URL (pdf_url or jpg_url) must be provided'
);

function detectLocale(request: NextRequest): 'en' | 'es' {
  const url = new URL(request.url);
  const langParam = url.searchParams.get('lang') || url.searchParams.get('locale');
  if (langParam === 'es' || langParam === 'español' || langParam === 'spanish') return 'es';
  if (langParam === 'en' || langParam === 'english' || langParam === 'inglés') return 'en';
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.toLowerCase().includes('es')) return 'es';
  return 'en';
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const locale = detectLocale(request);
  const t = await getTranslations({ locale, namespace: 'certificates.updateFiles' });

  try {
    const { certificateId } = await params;

    // Validate certificate_id format
    if (!isValidCertificateId(certificateId)) {
      return NextResponse.json(
        {
          success: false,
          error: t('invalidFormat'),
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateFilesSchema.safeParse(body);

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
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Check if certificate exists
      const checkResult = await client.query(
        'SELECT id, certificate_id, status FROM certificates WHERE certificate_id = $1',
        [certificateId]
      );

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: t('notFound'),
          },
          { status: 404 }
        );
      }

      const cert = checkResult.rows[0];

      // Build dynamic UPDATE query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.pdf_url !== undefined) {
        updates.push(`pdf_url = $${paramIndex}`);
        values.push(data.pdf_url);
        paramIndex++;
      }

      if (data.jpg_url !== undefined) {
        updates.push(`jpg_url = $${paramIndex}`);
        values.push(data.jpg_url);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);
      values.push(certificateId);

      // Update certificate
      await client.query(
        `
        UPDATE certificates
        SET ${updates.join(', ')}
        WHERE certificate_id = $${paramIndex}
        `,
        values
      );


      console.log(cert)
      // Log audit event
      await client.query(
        `
        INSERT INTO certificate_events (certificate_id, certificate_uuid, event_type, actor_type, metadata)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          certificateId,
          cert.id,
          'files_updated',
          'system',
          JSON.stringify({
            pdf_url_updated: data.pdf_url !== undefined,
            jpg_url_updated: data.jpg_url !== undefined,
          }),
        ]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          message: t('success'),
          certificate_id: certificateId,
        },
        { status: 200 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[API] Update certificate files error:', error);
    return NextResponse.json(
      {
        success: false,
        error: t('errorInternal'),
      },
      { status: 500 }
    );
  }
}
