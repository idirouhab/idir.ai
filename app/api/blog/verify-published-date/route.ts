import { NextRequest, NextResponse } from 'next/server';
import { getAdminBlogClient } from '@/lib/blog';

/**
 * Verification endpoint to check if published_at is properly set
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminBlogClient();

    // Get all published posts with their published_at dates
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, status, published_at, created_at, language')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
