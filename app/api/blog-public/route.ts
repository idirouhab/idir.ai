import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    // Debug logging
    console.log('[blog-public] Query params:', { limitParam, languageParam, sortParam, limit, language });

    const baseUrl = 'https://idir.ai';
    const orderClause = ascending ? 'ASC' : 'DESC';

    // If specific language requested, return only that language
    if (language) {
      console.log(`[blog-public] Fetching posts for language: ${language}, limit: ${limit}`);
      const result = await query(
        `SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category,
                p.tags, p.language, p.read_time_minutes, p.published_at, p.created_at,
                p.updated_at, p.meta_description, p.author_id, u.first_name, u.last_name
         FROM blog_posts p
         LEFT JOIN users u ON u.id = p.author_id
         WHERE p.status = 'published' AND p.language = $1
         ORDER BY p.published_at ${orderClause}
         LIMIT $2`,
        [language, limit]
      );

      const postsWithUrls = (result.rows || []).map((post: any) => ({
        ...post,
        author_name: post.first_name ? `${post.first_name} ${post.last_name || ''}`.trim() : null,
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
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Fetch posts for both languages
    const enResult = await query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category,
              p.tags, p.language, p.read_time_minutes, p.published_at, p.created_at,
              p.updated_at, p.meta_description, p.author_id, u.first_name, u.last_name
       FROM blog_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.status = 'published' AND p.language = 'en'
       ORDER BY p.published_at ${orderClause}
       LIMIT $1`,
      [limit]
    );

    const esResult = await query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category,
              p.tags, p.language, p.read_time_minutes, p.published_at, p.created_at,
              p.updated_at, p.meta_description, p.author_id, u.first_name, u.last_name
       FROM blog_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.status = 'published' AND p.language = 'es'
       ORDER BY p.published_at ${orderClause}
       LIMIT $1`,
      [limit]
    );

    // Add URLs to posts
    const enPostsWithUrls = (enResult.rows || []).map((post: any) => ({
      ...post,
      author_name: post.first_name ? `${post.first_name} ${post.last_name || ''}`.trim() : null,
      url: `${baseUrl}/en/blog/${post.slug}`,
    }));

    const esPostsWithUrls = (esResult.rows || []).map((post: any) => ({
      ...post,
      author_name: post.first_name ? `${post.first_name} ${post.last_name || ''}`.trim() : null,
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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
