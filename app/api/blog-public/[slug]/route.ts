import { NextRequest, NextResponse } from 'next/server';
import { getBlogClient } from '@/lib/blog';

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
  { params }: { params: { slug: string } }
) {
  try {
    const { slug: id } = params; // Using slug param name but treating as ID
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

    const supabase = getBlogClient();
    const baseUrl = 'https://idir.ai';

    // Fetch the specific post by ID
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, cover_image, category, tags, language, read_time_minutes, published_at, created_at, updated_at, author_name, meta_description')
      .eq('status', 'published')
      .eq('id', id)
      .eq('language', languageParam)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          {
            success: false,
            error: 'Blog post not found'
          },
          { status: 404 }
        );
      }

      console.error(`Error fetching post ${id}:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch blog post' },
        { status: 500 }
      );
    }

    // Add URL to post
    const postWithUrl = {
      ...data,
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
