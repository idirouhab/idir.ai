import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await query(
      `UPDATE blog_posts
       SET view_count = COALESCE(view_count, 0) + 1
       WHERE id = $1 AND status = 'published'`,
      [slug]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing blog view count:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
