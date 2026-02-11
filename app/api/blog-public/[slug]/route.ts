import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Public API endpoint to get a single published blog post by ID
 * No authentication required
 *
 * Path Parameters:
 * - id: The post ID (UUID)
 *
 * Query Parameters:
 * - language: Filter by language ('en' or 'es', required)
 *
 * Usage Examples:
 * GET /api/blog-public/550e8400-e29b-41d4-a716-446655440000?language=en
 * GET /api/blog-public/550e8400-e29b-41d4-a716-446655440000?language=es
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: id } = await params; // Using slug param name but treating as ID
    const searchParams = request.nextUrl.searchParams;
    const languageParam = searchParams.get('language');

    // Validate language parameter
    if (!languageParam || (languageParam !== 'en' && languageParam !== 'es')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Language parameter is required and must be "en" or "es"'
        },
        { status: 400 }
      );
    }

    const baseUrl = 'https://idir.ai';

    // Fetch the specific post by ID
    const result = await query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, p.category,
              p.tags, p.language, p.read_time_minutes, p.published_at, p.created_at,
              p.updated_at, p.meta_description, p.author_id, u.first_name, u.last_name
       FROM blog_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.status = 'published' AND p.id = $1 AND p.language = $2
       LIMIT 1`,
      [id, languageParam]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      );
    }
    const data = result.rows[0];

    // Add URL to post
    const postWithUrl = {
      ...data,
      author_name: data.first_name
        ? `${data.first_name} ${data.last_name || ''}`.trim()
        : null,
      url: `${baseUrl}/${data.language}/blog/${data.slug}`,
    };

    return NextResponse.json(
      {
        success: true,
        data: postWithUrl,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/blog-public/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog post'
      },
      { status: 500 }
    );
  }
}
