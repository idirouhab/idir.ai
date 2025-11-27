import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';

// Helper to get PostgREST config
function getPostgRESTConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // Add /rest/v1 if not already present (works for both cloud and local Supabase)
  const baseURL = url.includes('/rest/v1')
    ? url
    : `${url}/rest/v1`;

  return {
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  };
}

// Get all blog posts (admin only)
export async function GET() {
  try {
    // Check authentication and role using NextAuth
    const authResult = await requireRole(['owner', 'admin']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const config = getPostgRESTConfig();

    if (!config.baseURL || !config.headers.apikey) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    console.log('Fetching from:', config.baseURL);

    const response = await fetch(
      `${config.baseURL}/blog_posts?select=*&order=created_at.desc`,
      {
        headers: config.headers,
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
