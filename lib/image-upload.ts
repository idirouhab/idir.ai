import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'blog-image';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

export type ImageUploadError = {
  message: string;
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'VALIDATION_FAILED';
};

export type ImageUploadResult = {
  success: boolean;
  url?: string;
  error?: ImageUploadError;
};

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File): ImageUploadError | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      code: 'FILE_TOO_LARGE',
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      message: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      code: 'INVALID_TYPE',
    };
  }

  return null;
}

/**
 * Generates a unique file path for the image
 * Format: blog-images/{year}/{month}/{timestamp}-{random}-{filename}
 */
export function generateImagePath(filename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  // Sanitize filename
  const sanitizedFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');

  return `${year}/${month}/${timestamp}-${random}-${sanitizedFilename}`;
}

/**
 * Uploads an image to Supabase Storage
 */
export async function uploadBlogImage(
  file: File,
  sessionToken?: string
): Promise<ImageUploadResult> {
  // Validate file
  const validationError = validateImageFile(file);
  if (validationError) {
    return {
      success: false,
      error: validationError,
    };
  }

  try {
    // Generate unique path
    const filePath = generateImagePath(file.name);

    // Create authenticated client if session token provided
    const client = sessionToken
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          },
        })
      : supabaseClient;

    // Upload file
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Failed to upload image',
          code: 'UPLOAD_FAILED',
        },
      };
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred during upload',
        code: 'UPLOAD_FAILED',
      },
    };
  }
}

/**
 * Deletes an image from Supabase Storage
 */
export async function deleteBlogImage(
  imageUrl: string,
  sessionToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/blog-images\/(.+)/);

    if (!pathMatch) {
      return {
        success: false,
        error: 'Invalid image URL format',
      };
    }

    const filePath = pathMatch[1];

    // Create authenticated client if session token provided
    const client = sessionToken
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          },
        })
      : supabaseClient;

    const { error } = await client.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during deletion',
    };
  }
}

/**
 * Gets optimized image URL with transformations
 * Supabase supports width, height, quality transformations
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number; // 0-100
  } = {}
): string {
  const url = new URL(imageUrl);

  if (options.width) {
    url.searchParams.set('width', options.width.toString());
  }

  if (options.height) {
    url.searchParams.set('height', options.height.toString());
  }

  if (options.quality) {
    url.searchParams.set('quality', options.quality.toString());
  }

  return url.toString();
}
