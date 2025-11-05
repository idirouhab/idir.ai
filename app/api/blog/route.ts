import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getAdminBlogClient, calculateReadTime, BlogPostInput } from '@/lib/blog';

// Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BlogPostInput = await request.json();

    // Calculate read time if not provided
    if (!body.read_time_minutes) {
      body.read_time_minutes = calculateReadTime(body.content);
    }

    // Set published_at if publishing
    if (body.status === 'published' && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const supabase = getAdminBlogClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
