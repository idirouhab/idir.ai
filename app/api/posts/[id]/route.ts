import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import {isAdmin, isBlogEditor} from '@/lib/app-roles';
import { calculateReadTime } from '@/lib/blog';
import { query } from '@/lib/db';

/**
 * GET /api/posts/{id}
 * Get a single blog post by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if requesting draft
    const searchParams = request.nextUrl.searchParams;
    const includeDraft = searchParams.get('draft') === 'true';

    let where = `p.id = $1`;
    const queryParams: any[] = [id];

    // If requesting drafts, require auth
    if (includeDraft) {
      const authResult = await requireRole(['super_admin', 'blog_editor']);
      if (!authResult.authorized) {
        return authResult.response;
      }
    } else {
      where += ` AND p.status = 'published'`;
    }

    const result = await query(
      `SELECT p.*, u.first_name, u.last_name
       FROM blog_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE ${where}
       LIMIT 1`,
      queryParams
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const data = result.rows[0];
    const post = {
      ...data,
      author_name: data.first_name
        ? `${data.first_name} ${data.last_name || ''}`.trim()
        : null,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use NextAuth for authentication
    const authResult = await requireRole(['super_admin', 'blog_editor']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const user = authResult.user;
    const body = await request.json();
    // Verify ownership
    const existingResult = await query(
      `SELECT author_id FROM blog_posts WHERE id = $1 LIMIT 1`,
      [id]
    );
    const existingPost = existingResult.rows[0];

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check permissions - user can only edit their own posts unless they're owner or admin
    if (existingPost.author_id !== user.userId && !isBlogEditor(user.roles)) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own posts' },
        { status: 403 }
      );
    }

    // Handle publish permissions - only owner and admin can publish
    const canUserPublish = isBlogEditor(user.roles);
    if (!canUserPublish && body.status === 'published') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and blog editors can publish posts' },
        { status: 403 }
      );
    }

    if (!canUserPublish) {
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

    const fields = Object.keys(body).filter((key) => body[key] !== undefined);
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map((f) => body[f]);

    const updateResult = await query(
      `UPDATE blog_posts
       SET ${setClause}
       WHERE id = $${fields.length + 1}
       RETURNING *`,
      [...values, id]
    );

    return NextResponse.json({ data: updateResult.rows[0] });
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
 * Delete a blog post
 * - Owners and admins can delete any post
 * - Bloggers can only delete their own posts
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Require authentication
    const authResult = await requireRole(['super_admin', 'billing_admin']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const user = authResult.user;

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Verify post exists and get author
    const existingResult = await query(
      `SELECT id, author_id FROM blog_posts WHERE id = $1 LIMIT 1`,
      [id]
    );
    const existingPost = existingResult.rows[0];

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Non-admins can only delete their own posts
    if (!isAdmin(user.roles) && existingPost.author_id !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts' },
        { status: 403 }
      );
    }

    await query(`DELETE FROM blog_posts WHERE id = $1`, [id]);

    return NextResponse.json({ data: { deleted: true } });
  } catch (error: any) {
    console.error('Error in DELETE /api/posts/[id]:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
