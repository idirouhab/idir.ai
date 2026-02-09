import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { buildR2PublicUrl, getR2Client, R2_BUCKET } from '@/lib/r2';
import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';

const BUCKET_NAME = R2_BUCKET;
const LOCAL_MEDIA_DIR = process.env.LOCAL_MEDIA_DIR || 'public/uploads';
const STORAGE_MODE =
  process.env.MEDIA_STORAGE || (process.env.NODE_ENV === 'production' ? 'r2' : 'local');

function getLocalPublicBaseUrl() {
  const base =
    process.env.LOCAL_MEDIA_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';
  return base.replace(/\/+$/, '');
}

function buildLocalPublicUrl(key: string) {
  return `${getLocalPublicBaseUrl()}/uploads/${key}`;
}

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
    const authResult = await requireRole(['super_admin', 'blog_editor']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const allImages: any[] = [];

    if (STORAGE_MODE === 'local') {
      const root = path.join(process.cwd(), LOCAL_MEDIA_DIR);
      const walk = async (dir: string, prefix: string) => {
        let entries: Dirent[];
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
          return;
        }

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const key = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.isDirectory()) {
            await walk(fullPath, key);
          } else {
            const stats = await fs.stat(fullPath);
            const name = entry.name;
            const lastModified = stats.mtime.toISOString();
            allImages.push({
              name,
              path: key,
              url: buildLocalPublicUrl(key),
              size: stats.size || 0,
              created_at: stats.birthtime?.toISOString() || lastModified,
              updated_at: lastModified,
              mimetype: guessMimeType(key),
            });
          }
        }
      };
      await walk(root, '');
    } else {
      const r2 = getR2Client();
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
    }

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
