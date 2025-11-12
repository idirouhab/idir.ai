import { NextRequest, NextResponse } from 'next/server';
import { getBlogClient } from '@/lib/blog';

/**
 * Get posts grouped by translation_group_id for newsletters
 * Returns posts in a structure optimized for language-specific content delivery
 *
 * Query parameters:
 * - published_date: Filter by published date (YYYY-MM-DD)
 * - category: Filter by category
 * - limit: Number of translation groups to return
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const publishedDate = searchParams.get('published_date');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = getBlogClient();

    // Build query
    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image, category, tags, language, published_at, read_time_minutes, view_count, translation_group_id')
      .eq('status', 'published')
      .not('translation_group_id', 'is', null)
      .order('published_at', { ascending: false });

    // Filter by published date if provided
    if (publishedDate) {
      const startOfDay = new Date(publishedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(publishedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query = query
        .gte('published_at', startOfDay.toISOString())
        .lte('published_at', endOfDay.toISOString());
    }

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching grouped posts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group posts by translation_group_id
    const groupedMap = new Map<string, { en?: any; es?: any; published_at: string; translation_group_id: string }>();

    posts?.forEach((post) => {
      const groupId = post.translation_group_id!;

      if (!groupedMap.has(groupId)) {
        groupedMap.set(groupId, {
          translation_group_id: groupId,
          published_at: post.published_at!,
        });
      }

      const group = groupedMap.get(groupId)!;

      // Build version object with full URLs
      const version = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        cover_image: post.cover_image,
        url: `https://idir.ai/${post.language}/blog/${post.slug}`,
        tags: post.tags,
        category: post.category,
        read_time_minutes: post.read_time_minutes,
        view_count: post.view_count,
      };

      if (post.language === 'en') {
        group.en = version;
      } else {
        group.es = version;
      }
    });

    // Convert to array and sort by published_at
    const grouped = Array.from(groupedMap.values())
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, limit);

    // Calculate stats
    const totalGroups = grouped.length;
    const postsWithBothLanguages = grouped.filter(g => g.en && g.es).length;
    const postsWithOnlyEn = grouped.filter(g => g.en && !g.es).length;
    const postsWithOnlyEs = grouped.filter(g => !g.en && g.es).length;

    return NextResponse.json({
      data: grouped,
      meta: {
        total_groups: totalGroups,
        with_both_languages: postsWithBothLanguages,
        only_english: postsWithOnlyEn,
        only_spanish: postsWithOnlyEs,
        filters: {
          published_date: publishedDate || 'all',
          category: category || 'all',
          limit,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/blog/grouped:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
