import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// Get all blog posts (admin only)
export async function GET() {
  try {
    // Check authentication - use same cookie name as other admin pages
    const sessionCookie = cookies().get('admin-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SECURITY: Only owners and admins can access all blog posts
    if (payload.role !== 'owner' && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can access this endpoint' },
        { status: 403 }
      );
    }

    // Use direct PostgREST fetch for local development
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    console.log('Fetching from:', supabaseUrl);

    const response = await fetch(
      `${supabaseUrl}/blog_posts?select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostgREST error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    const data = await response.json();
    console.log('Successfully fetched', data?.length || 0, 'blog posts');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/blog-admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
