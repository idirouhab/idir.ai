import { NextRequest, NextResponse } from 'next/server';
import { requireRole, canPublish } from '@/lib/auth';
import { calculateReadTime, BlogPostInput } from '@/lib/blog';
import { query } from '@/lib/db';

// Create a new blog post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireRole(request, ['super_admin', 'blog_editor']);

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
    };

    const fields = Object.keys(postData);
    const values = fields.map((f) => (postData as any)[f]);
    const cols = fields.join(', ');
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    const result = await query(
      `INSERT INTO blog_posts (${cols})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/blog:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
