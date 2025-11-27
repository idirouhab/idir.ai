import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { getBlogClient } from '@/lib/blog';

/**
 * Get ALL posts (published + drafts) grouped by translation_group_id for admin
 * Returns posts in a structure optimized for admin management
 *
 * Query parameters:
 * - limit: Number of translation groups to return
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and role
    const authResult = await requireRole(['owner', 'admin', 'blogger']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');

    const supabase = getBlogClient();

    // Build query - fetch ALL posts (published + drafts)
    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image, category, tags, language, published_at, read_time_minutes, view_count, translation_group_id, status')
      .not('translation_group_id', 'is', null)
      .order('created_at', { ascending: false });

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching grouped posts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group posts by translation_group_id
    const groupedMap = new Map<string, { en?: any; es?: any; published_at: string | null; translation_group_id: string }>();

    posts?.forEach((post) => {
      const groupId = post.translation_group_id!;

      if (!groupedMap.has(groupId)) {
        groupedMap.set(groupId, {
          translation_group_id: groupId,
          published_at: post.published_at,
        });
      }

      const group = groupedMap.get(groupId)!;

      // Build version object with all necessary fields for admin
      const version = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        cover_image: post.cover_image,
        tags: post.tags,
        category: post.category,
        read_time_minutes: post.read_time_minutes,
        view_count: post.view_count,
        language: post.language,
        status: post.status,
        published_at: post.published_at,
      };

      if (post.language === 'en') {
        group.en = version;
      } else {
        group.es = version;
      }
    });

    // Convert to array and sort by published_at (nulls last)
    const grouped = Array.from(groupedMap.values())
      .sort((a, b) => {
        // Put drafts (null published_at) at the end
        if (!a.published_at && b.published_at) return 1;
        if (a.published_at && !b.published_at) return -1;
        if (!a.published_at && !b.published_at) return 0;
        // Both have published_at, compare dates
        return new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime();
      })
      .slice(0, limit);

    // Calculate stats
    const totalGroups = grouped.length;
    const publishedGroups = grouped.filter(g => (g.en?.status === 'published' || g.es?.status === 'published')).length;
    const draftGroups = grouped.filter(g => (g.en?.status === 'draft' && g.es?.status === 'draft') || (!g.en?.status || !g.es?.status)).length;
    const postsWithBothLanguages = grouped.filter(g => g.en && g.es).length;

    return NextResponse.json({
      data: grouped,
      meta: {
        total_groups: totalGroups,
        published_groups: publishedGroups,
        draft_groups: draftGroups,
        with_both_languages: postsWithBothLanguages,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/blog/grouped-admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
