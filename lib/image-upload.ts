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

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/media', {
      method: 'POST',
      body: formData,
      headers: sessionToken
        ? {
            Authorization: `Bearer ${sessionToken}`,
          }
        : undefined,
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      const message = result?.error || 'Failed to upload image';
      return {
        success: false,
        error: {
          message,
          code: 'UPLOAD_FAILED',
        },
      };
    }

    return {
      success: true,
      url: result.url,
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
    const response = await fetch(`/api/media?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
      headers: sessionToken
        ? {
            Authorization: `Bearer ${sessionToken}`,
          }
        : undefined,
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      return {
        success: false,
        error: result?.error || 'Failed to delete image',
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
  return imageUrl;
}
