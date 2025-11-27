import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { getAdminBlogClient } from '@/lib/blog';

const BUCKET_NAME = 'blog-image';

/**
 * List all images from the blog-image bucket
 * Returns images with metadata including URL, size, created date
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and role using NextAuth
    const authResult = await requireRole(['owner', 'admin', 'blogger']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const supabase = getAdminBlogClient();

    // List all files in the bucket
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing files:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to list images' },
        { status: 500 }
      );
    }

    // Recursively get all images from subdirectories
    const allImages: any[] = [];

    async function listDirectory(path: string = '') {
      const { data: items, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(path, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError || !items) return;

      for (const item of items) {
        const fullPath = path ? `${path}/${item.name}` : item.name;

        // If it's a file (has metadata), add it to our list
        if (item.metadata) {
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fullPath);

          allImages.push({
            name: item.name,
            path: fullPath,
            url: urlData.publicUrl,
            size: item.metadata.size,
            created_at: item.created_at,
            updated_at: item.updated_at,
            mimetype: item.metadata.mimetype,
          });
        } else {
          // If it's a directory, recursively list its contents
          await listDirectory(fullPath);
        }
      }
    }

    // Start listing from root
    await listDirectory();

    return NextResponse.json({
      success: true,
      images: allImages,
      count: allImages.length,
    });
  } catch (error: any) {
    console.error('List exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
