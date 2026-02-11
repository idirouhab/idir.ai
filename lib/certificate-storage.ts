import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { buildR2PublicUrl, getR2Client, getR2KeyFromUrl, R2_BUCKET } from '@/lib/r2';

export type CertificateStorageResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Generates a unique file path for the certificate
 * Format: certificates/{year}/{month}/cert-{certificateId}.png
 */
export function generateCertificatePath(certificateId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `certificates/${year}/${month}/cert-${certificateId}.png`;
}

/**
 * Saves a certificate image to Supabase Storage
 */
export async function saveCertificateToStorage(
  certificateId: string,
  imageBuffer: ArrayBuffer
): Promise<CertificateStorageResult> {
  try {
    // Generate unique path
    const filePath = generateCertificatePath(certificateId);

    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: filePath,
      Body: Buffer.from(imageBuffer),
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await client.send(command);

    return {
      success: true,
      url: buildR2PublicUrl(filePath),
    };
  } catch (error) {
    console.error('Certificate upload exception:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during certificate upload',
    };
  }
}

/**
 * Deletes a certificate from Supabase Storage
 */
export async function deleteCertificate(
  certificateUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const filePath = getR2KeyFromUrl(certificateUrl);
    if (!filePath) {
      return { success: false, error: 'Invalid certificate URL format' };
    }

    const client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: filePath,
    });

    await client.send(command);

    return { success: true };
  } catch (error) {
    console.error('Certificate delete exception:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during deletion',
    };
  }
}
