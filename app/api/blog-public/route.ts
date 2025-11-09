import { NextRequest, NextResponse } from 'next/server';
import { getBlogClient } from '@/lib/blog';

/**
 * Public API endpoint to get published blog posts
 * No authentication required
 *
 * Query Parameters:
 * - limit: Number of posts per language (default: 10, max: 50)
 * - language: Filter by language ('en' or 'es', default: both)
 * - sort: Sort order ('asc' or 'desc', default: 'desc')
 *
 * Usage Examples:
 * GET /api/blog-public                          // Get 10 latest posts in both languages
 * GET /api/blog-public?limit=5                  // Get 5 latest posts in both languages
 * GET /api/blog-public?language=en              // Get only English posts
 * GET /api/blog-public?limit=20&sort=asc        // Get 20 oldest posts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const limitParam = searchParams.get('limit');
    const languageParam = searchParams.get('language');
    const sortParam = searchParams.get('sort');

    // Validate and set defaults
    const limit = Math.min(Math.max(parseInt(limitParam || '10'), 1), 50);
    const language = languageParam === 'en' || languageParam === 'es' ? languageParam : null;
    const sortOrder = sortParam === 'asc' ? 'asc' : 'desc';
    const ascending = sortOrder === 'asc';

    const supabase = getBlogClient();
    const baseUrl = 'https://idir.ai';

    // If specific language requested, return only that language
    if (language) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, cover_image, category, tags, language, read_time_minutes, published_at, created_at, updated_at, author_name, meta_description')
        .eq('status', 'published')
        .eq('language', language)
        .order('published_at', { ascending })
        .limit(limit);

      if (error) {
        console.error(`Error fetching ${language} posts:`, error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch blog posts' },
          { status: 500 }
        );
      }

      // Add URL to each post
      const postsWithUrls = (data || []).map(post => ({
        ...post,
        url: `${baseUrl}/${post.language}/blog/${post.slug}`,
      }));

      return NextResponse.json({
        success: true,
        data: {
          [language]: postsWithUrls,
        },
        meta: {
          total: postsWithUrls.length,
          limit,
          language,
          sort: sortOrder,
        },
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Fetch posts for both languages
    const { data: enPosts, error: enError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, cover_image, category, tags, language, read_time_minutes, published_at, created_at, updated_at, author_name, meta_description')
      .eq('status', 'published')
      .eq('language', 'en')
      .order('published_at', { ascending })
      .limit(limit);

    const { data: esPosts, error: esError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, cover_image, category, tags, language, read_time_minutes, published_at, created_at, updated_at, author_name, meta_description')
      .eq('status', 'published')
      .eq('language', 'es')
      .order('published_at', { ascending })
      .limit(limit);

    if (enError) {
      console.error('Error fetching English posts:', enError);
    }

    if (esError) {
      console.error('Error fetching Spanish posts:', esError);
    }

    // Add URLs to posts
    const enPostsWithUrls = (enPosts || []).map(post => ({
      ...post,
      url: `${baseUrl}/en/blog/${post.slug}`,
    }));

    const esPostsWithUrls = (esPosts || []).map(post => ({
      ...post,
      url: `${baseUrl}/es/blog/${post.slug}`,
    }));

    return NextResponse.json({
      success: true,
      data: {
        en: enPostsWithUrls,
        es: esPostsWithUrls,
      },
      meta: {
        total: {
          en: enPostsWithUrls.length,
          es: esPostsWithUrls.length,
        },
        limit,
        sort: sortOrder,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/blog-public:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts'
      },
      { status: 500 }
    );
  }
}
