import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, canPublish } from '@/lib/auth';
import { getAdminBlogClient, calculateReadTime, BlogPostInput } from '@/lib/blog';

// Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and get user
    const user = await requireAuth(request);

    const body: Partial<BlogPostInput> = await request.json();

    // SECURITY: Verify ownership - first fetch the existing post
    const supabase = getAdminBlogClient();
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('author_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // SECURITY: Only the author or owner role can update the post
    if (existingPost.author_id !== user.userId && user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own posts' },
        { status: 403 }
      );
    }

    // ROLE-BASED PERMISSION: Only owners and admins can publish
    if (!canPublish(user) && body.status === 'published') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can publish posts. Your changes have been saved as draft.' },
        { status: 403 }
      );
    }

    // Force draft status for non-publishers if they try to publish
    if (!canPublish(user)) {
      body.status = 'draft';
      body.published_at = null;
    }

    // Calculate read time if content changed
    if (body.content && !body.read_time_minutes) {
      body.read_time_minutes = calculateReadTime(body.content);
    }

    // Set published_at if changing to published (only for owners)
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
      console.error('Error updating blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT /api/blog/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and get user
    const user = await requireAuth(request);

    // ROLE-BASED PERMISSION: Only owners can delete posts
    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners can delete posts' },
        { status: 403 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // SECURITY: Owners can delete any post (for content moderation)
    // For other roles, verify ownership
    const supabase = getAdminBlogClient();

    // Verify post exists
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // NOTE: Owners can delete any post for content moderation
    // This allows you to remove inappropriate content if needed
    const { error } = await supabase.from('blog_posts').delete().eq('id', params.id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/blog/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
