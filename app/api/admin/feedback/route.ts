import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// Helper to get PostgREST config
function getPostgRESTConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // For Supabase Cloud, append /rest/v1 if not already present
  // For local Supabase, use the URL as-is
  const baseURL = url.includes('supabase.co') && !url.includes('/rest/v1')
    ? `${url}/rest/v1`
    : url;

  return {
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  };
}

/**
 * Get all feedback with filters
 * GET /api/admin/feedback?status=unanswered&date=2024-01-15
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = cookies().get('admin-session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'answered', 'unanswered', 'all'
    const date = searchParams.get('date'); // campaign_date filter
    const feedbackType = searchParams.get('type'); // feedback_type filter

    const config = getPostgRESTConfig();

    // Build PostgREST query
    let queryParams = 'select=*&order=responded_at.desc.nullslast';

    // Filter by status
    if (status === 'answered') {
      queryParams += '&answered_at=not.is.null';
    } else if (status === 'unanswered') {
      queryParams += '&answered_at=is.null';
    }

    // Filter by date
    if (date) {
      queryParams += `&campaign_date=eq.${date}`;
    }

    // Filter by feedback type
    if (feedbackType) {
      queryParams += `&feedback_type=eq.${feedbackType}`;
    }

    const response = await fetch(
      `${config.baseURL}/newsletter_feedback?${queryParams}`,
      {
        headers: config.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostgREST error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Get summary stats
    const statsResponse = await fetch(
      `${config.baseURL}/newsletter_feedback?select=id,answered_at,feedback_type`,
      {
        headers: config.headers,
      }
    );

    const statsData = statsResponse.ok ? await statsResponse.json() : [];

    const stats = {
      total: statsData?.length || 0,
      answered: statsData?.filter((f: any) => f.answered_at).length || 0,
      unanswered: statsData?.filter((f: any) => !f.answered_at).length || 0,
      byType: {
        very_useful: statsData?.filter((f: any) => f.feedback_type === 'very_useful').length || 0,
        useful: statsData?.filter((f: any) => f.feedback_type === 'useful').length || 0,
        not_useful: statsData?.filter((f: any) => f.feedback_type === 'not_useful').length || 0,
      },
    };

    return NextResponse.json({
      success: true,
      feedback: data,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update feedback status (mark as answered/unanswered)
 * PATCH /api/admin/feedback
 * Body: { id: string, answered: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = cookies().get('admin-session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, answered } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    const config = getPostgRESTConfig();

    const response = await fetch(
      `${config.baseURL}/newsletter_feedback?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          ...config.headers,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          answered_at: answered ? new Date().toISOString() : null,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostgREST error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      feedback: data[0],
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
