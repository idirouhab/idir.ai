import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, canPublish } from '@/lib/auth';
import { getAdminBlogClient, calculateReadTime, BlogPostInput } from '@/lib/blog';

// Create a new blog post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request);

    const body: BlogPostInput = await request.json();

    // Calculate read time if not provided
    if (!body.read_time_minutes) {
      body.read_time_minutes = calculateReadTime(body.content);
    }

    // ROLE-BASED PERMISSION: Only owners and admins can publish
    if (!canPublish(user)) {
      // Force status to draft for non-publishers
      body.status = 'draft';
      body.published_at = null;
    } else {
      // Owners and admins can publish directly
      if (body.status === 'published' && !body.published_at) {
        body.published_at = new Date().toISOString();
      }
    }

    // Add author information
    const postData = {
      ...body,
      author_id: user.userId,
      author_name: user.email,
    };

    const supabase = getAdminBlogClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/blog:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
