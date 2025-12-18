import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key to bypass RLS for certificate storage
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'blog-image';

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

    // Upload file using admin client to bypass RLS
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year cache (certificates don't change)
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Certificate upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload certificate',
      };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
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
    // Extract file path from URL
    const url = new URL(certificateUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/blog-image\/(.+)/);

    if (!pathMatch) {
      return {
        success: false,
        error: 'Invalid certificate URL format',
      };
    }

    const filePath = pathMatch[1];

    // Use admin client to bypass RLS
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Certificate delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete certificate',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Certificate delete exception:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during deletion',
    };
  }
}
