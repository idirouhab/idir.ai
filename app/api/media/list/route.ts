import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { buildR2PublicUrl, getR2Client, R2_BUCKET } from '@/lib/r2';

const BUCKET_NAME = R2_BUCKET;

function guessMimeType(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'unknown';
}

/**
 * List all images from the blog-images bucket
 * Returns images with metadata including URL, size, created date
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and role using NextAuth
    const authResult = await requireRole(['super_admin', 'billing_admin']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const r2 = getR2Client();
    const allImages: any[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await r2.send(
        new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        })
      );

      for (const item of response.Contents || []) {
        if (!item.Key) continue;
        const key = item.Key;
        const name = key.split('/').pop() || key;
        const lastModified = item.LastModified?.toISOString() || new Date().toISOString();

        allImages.push({
          name,
          path: key,
          url: buildR2PublicUrl(key),
          size: item.Size || 0,
          created_at: lastModified,
          updated_at: lastModified,
          mimetype: guessMimeType(key),
        });
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    allImages.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

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
