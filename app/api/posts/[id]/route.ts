import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, canPublish, checkAuth } from '@/lib/auth';
import { getAdminBlogClient, getBlogClient, calculateReadTime } from '@/lib/blog';

/**
 * GET /api/posts/{id}
 * Get a single blog post by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if requesting draft
    const searchParams = request.nextUrl.searchParams;
    const includeDraft = searchParams.get('draft') === 'true';

    let supabase = getBlogClient();
    let query = supabase
      .from('blog_posts')
      .select('*, users!blog_posts_author_id_fkey(name)')
      .eq('id', params.id);

    // If requesting drafts, require auth
    if (includeDraft) {
      const user = await checkAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      supabase = getAdminBlogClient();
      query = supabase
        .from('blog_posts')
        .select('*, users!blog_posts_author_id_fkey(name)')
        .eq('id', params.id);
    } else {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = {
      ...data,
      author_name: (data as any).users?.name || null,
      users: undefined,
    };

    return NextResponse.json({ data: post });
  } catch (error: any) {
    console.error('Error in GET /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/posts/{id}
 * Update a blog post
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const supabase = getAdminBlogClient();

    // Verify ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('author_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check permissions
    if (existingPost.author_id !== user.userId && user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own posts' },
        { status: 403 }
      );
    }

    // Handle publish permissions
    if (!canPublish(user) && body.status === 'published') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can publish posts' },
        { status: 403 }
      );
    }

    if (!canPublish(user)) {
      body.status = 'draft';
      body.published_at = null;
    }

    // Calculate read time if content changed
    if (body.content && !body.read_time_minutes) {
      body.read_time_minutes = calculateReadTime(body.content);
    }

    // Set published_at if publishing
    if (body.status === 'published' && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error in PUT /api/posts/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/{id}
 * Delete a blog post (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);

    // Only owners can delete
    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners can delete posts' },
        { status: 403 }
      );
    }

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const supabase = getAdminBlogClient();

    // Verify post exists
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error: any) {
    console.error('Error in DELETE /api/posts/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
