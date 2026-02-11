import { NextRequest, NextResponse } from 'next/server';
import { requireRole, canPublish } from '@/lib/auth';
import { isBlogEditor, isSuperAdmin } from '@/lib/app-roles';
import { calculateReadTime, BlogPostInput } from '@/lib/blog';
import { query } from '@/lib/db';

// Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication and get user
    const user = await requireRole(request, ['super_admin', 'blog_editor']);

    const body: Partial<BlogPostInput> = await request.json();

    // SECURITY: Verify ownership - first fetch the existing post
    const existingResult = await query(
      `SELECT author_id FROM blog_posts WHERE id = $1 LIMIT 1`,
      [id]
    );
    const existingPost = existingResult.rows[0];

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // SECURITY: Only the author or owner role can update the post
    if (existingPost.author_id !== user.userId && !isBlogEditor(user.roles)) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own posts' },
        { status: 403 }
      );
    }

    // ROLE-BASED PERMISSION: Only owners and admins can publish
    if (!canPublish(user) && body.status === 'published') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and blog editors can publish posts. Your changes have been saved as draft.' },
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

    const fields = Object.keys(body).filter((key) => (body as any)[key] !== undefined);
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map((f) => (body as any)[f]);

    const updateResult = await query(
      `UPDATE blog_posts
       SET ${setClause}
       WHERE id = $${fields.length + 1}
       RETURNING *`,
      [...values, id]
    );

    return NextResponse.json(updateResult.rows[0]);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication and get user
    const user = await requireRole(request, ['super_admin', 'blog_editor']);

    // ROLE-BASED PERMISSION: Only owners can delete posts
    if (!isSuperAdmin(user.roles)) {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins can delete posts' },
        { status: 403 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // SECURITY: Owners can delete any post (for content moderation)
    // For other roles, verify ownership
    // Verify post exists
    const existingResult = await query(
      `SELECT id FROM blog_posts WHERE id = $1 LIMIT 1`,
      [id]
    );
    const existingPost = existingResult.rows[0];

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // NOTE: Owners can delete any post for content moderation
    // This allows you to remove inappropriate content if needed
    await query(`DELETE FROM blog_posts WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/blog/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
