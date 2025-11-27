import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { getAdminBlogClient } from '@/lib/blog';
import sharp from 'sharp';

const BUCKET_NAME = 'blog-image';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (increased since we'll compress)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

// Image compression settings
const IMAGE_QUALITY = 85; // Good balance between quality and size
const MAX_WIDTH = 1920; // Max width for blog images
const MAX_HEIGHT = 1080; // Max height for blog images

/**
 * Compress and optimize image using Sharp
 * Converts to WebP format for better compression
 * Maintains aspect ratio while respecting max dimensions
 */
async function compressImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  try {
    // Skip compression for GIFs (to preserve animation)
    if (mimeType === 'image/gif') {
      return { buffer, contentType: mimeType, extension: 'gif' };
    }

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Calculate new dimensions while maintaining aspect ratio
    let width = metadata.width || MAX_WIDTH;
    let height = metadata.height || MAX_HEIGHT;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const aspectRatio = width / height;
      if (width > height) {
        width = MAX_WIDTH;
        height = Math.round(MAX_WIDTH / aspectRatio);
      } else {
        height = MAX_HEIGHT;
        width = Math.round(MAX_HEIGHT * aspectRatio);
      }
    }

    // Compress and convert to WebP (best compression with good quality)
    const compressedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: IMAGE_QUALITY,
        effort: 4, // Balance between compression and speed (0-6)
      })
      .toBuffer();

    console.log(
      `Image compressed: ${Math.round(buffer.length / 1024)}KB → ${Math.round(
        compressedBuffer.length / 1024
      )}KB (${Math.round((1 - compressedBuffer.length / buffer.length) * 100)}% reduction)`
    );

    return {
      buffer: compressedBuffer,
      contentType: 'image/webp',
      extension: 'webp',
    };
  } catch (error) {
    console.error('Compression error:', error);
    // Fallback to original if compression fails
    const extension = mimeType.split('/')[1];
    return { buffer, contentType: mimeType, extension };
  }
}

/**
 * Server-side image upload endpoint
 * Uses service role key to bypass RLS
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await checkAuth(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to upload
    if (!['owner', 'admin', 'blogger'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique file path
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    console.log(`Original image size: ${Math.round(originalBuffer.length / 1024)}KB`);

    // PERFORMANCE: Compress image before upload
    const { buffer: compressedBuffer, contentType, extension } = await compressImage(
      originalBuffer,
      file.type
    );

    // Sanitize filename and update extension
    const baseFilename = file.name
      .toLowerCase()
      .replace(/\.[^.]+$/, '') // Remove original extension
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    const sanitizedFilename = `${baseFilename}.${extension}`;
    const filePath = `${year}/${month}/${timestamp}-${random}-${sanitizedFilename}`;

    // Use admin client to bypass RLS
    const supabase = getAdminBlogClient();

    // Upload compressed file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressedBuffer, {
        contentType,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    const originalSizeKB = Math.round(originalBuffer.length / 1024);
    const compressedSizeKB = Math.round(compressedBuffer.length / 1024);
    const reductionPercent = Math.round(
      (1 - compressedBuffer.length / originalBuffer.length) * 100
    );

    console.log('Uploaded image path:', data.path);
    console.log('Public URL:', urlData.publicUrl);
    console.log(
      `Compression: ${originalSizeKB}KB → ${compressedSizeKB}KB (${reductionPercent}% reduction)`
    );

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      compression: {
        originalSize: originalSizeKB,
        compressedSize: compressedSizeKB,
        reductionPercent,
        format: extension,
      },
    });
  } catch (error: any) {
    console.error('Upload exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Server-side image deletion endpoint
 * Requires admin authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await checkAuth(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete
    if (!['owner', 'admin', 'blogger'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get image URL from query params
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/blog-image\/(.+)/);

    if (!pathMatch) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    const filePath = pathMatch[1];

    // Use admin client to bypass RLS
    const supabase = getAdminBlogClient();

    // Delete file from storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete image' },
        { status: 500 }
      );
    }

    console.log('Deleted image:', filePath);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
