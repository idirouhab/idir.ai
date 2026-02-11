import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Verification endpoint to check if published_at is properly set
 */
export async function GET(request: NextRequest) {
  try {
    // Get all published posts with their published_at dates
    const result = await query(
      `SELECT id, slug, title, status, published_at, created_at, language
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY published_at DESC
       LIMIT 10`
    );
    const posts = result.rows;

    // Check for any published posts without published_at
    const missingDates = posts?.filter(p => !p.published_at) || [];

    return NextResponse.json({
      success: true,
      totalPublished: posts?.length || 0,
      missingPublishedDates: missingDates.length,
      posts: posts?.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        language: p.language,
        published_at: p.published_at,
        created_at: p.created_at,
        hasPublishedDate: !!p.published_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
