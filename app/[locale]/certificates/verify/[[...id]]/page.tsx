import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CertificateVerifyClient from './CertificateVerifyClient';

interface PageProps {
  params: Promise<{
    locale: string;
    id?: string[];
  }>;
}

/**
 * Fetch certificate data for metadata generation
 * This runs on the server only
 */
async function fetchCertificateData(certificateId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://idir.ai';
    const response = await fetch(`${baseUrl}/api/certificates/verify/${certificateId}`, {
      cache: 'no-store', // Always get fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.found ? data : null;
  } catch (error) {
    console.error('[Metadata] Failed to fetch certificate:', error);
    return null;
  }
}

/**
 * Generate dynamic metadata for SEO and Open Graph
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'certificates.verify' });

  // Extract certificate ID from params
  const certificateId = id?.[0]?.toUpperCase();

  // Base metadata (no certificate ID in URL)
  if (!certificateId) {
    const title = t('metaTitle');
    const description = t('metaDescription');

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: locale === 'es' ? 'es_ES' : 'en_US',
        url: `https://idir.ai/${locale}/certificates/verify`,
        siteName: 'idir.ai',
        images: [
          {
            url: 'https://idir.ai/og-image.png',
            width: 1200,
            height: 630,
            alt: 'idir.ai Certificate Verification',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://idir.ai/og-image.png'],
      },
    };
  }

  // Fetch certificate data for dynamic metadata
  const certData = await fetchCertificateData(certificateId);

  if (!certData) {
    // Certificate not found - return generic metadata
    const title = locale === 'es'
      ? `Certificado ${certificateId} - idir.ai`
      : `Certificate ${certificateId} - idir.ai`;

    const description = locale === 'es'
      ? `Verifica el certificado ${certificateId} en idir.ai`
      : `Verify certificate ${certificateId} on idir.ai`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: locale === 'es' ? 'es_ES' : 'en_US',
        url: `https://idir.ai/${locale}/certificates/verify/${certificateId}`,
        siteName: 'idir.ai',
        images: [
          {
            url: 'https://idir.ai/og-image.png',
            width: 1200,
            height: 630,
            alt: `Certificate ${certificateId}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://idir.ai/og-image.png'],
      },
    };
  }

  // Certificate found - generate rich metadata
  const studentName = certData.student_name;
  const courseTitle = certData.course_title;
  const issuedDate = new Date(certData.issued_at).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const title = locale === 'es'
    ? `Certificado Oficial de ${studentName} - idir.ai`
    : `Official Certificate of ${studentName} - idir.ai`;

  const description = locale === 'es'
    ? `${studentName} completó exitosamente el curso "${courseTitle}". Certificado ${certificateId} emitido el ${issuedDate}. Verificado y autenticado por idir.ai`
    : `${studentName} successfully completed the "${courseTitle}" course. Certificate ${certificateId} issued on ${issuedDate}. Verified and authenticated by idir.ai`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      url: `https://idir.ai/${locale}/certificates/verify/${certificateId}`,
      siteName: 'idir.ai',
      images: [
        {
          url: 'https://idir.ai/og-image.png', // TODO: Generate dynamic certificate OG image
          width: 1200,
          height: 630,
          alt: `${studentName} - ${courseTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://idir.ai/og-image.png'],
      creator: '@idir_ai',
    },
    alternates: {
      canonical: `https://idir.ai/${locale}/certificates/verify/${certificateId}`,
      languages: {
        'es': `https://idir.ai/es/certificates/verify/${certificateId}`,
        'en': `https://idir.ai/en/certificates/verify/${certificateId}`,
      },
    },
  };
}

/**
 * Certificate Verification Page
 * Supports both formats:
 * - /certificates/verify (manual search)
 * - /certificates/verify/:certificateId (auto-verify)
 */
export default async function CertificateVerifyPage({ params }: PageProps) {
  const { id } = await params;

  // Extract certificate ID from catch-all route
  const certificateId = id?.[0]?.toUpperCase();

  return <CertificateVerifyClient initialCertificateId={certificateId} />;
}
