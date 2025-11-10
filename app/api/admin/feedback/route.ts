import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status'); // 'answered', 'unanswered', 'all'
    const date = searchParams.get('date'); // campaign_date filter
    const feedbackType = searchParams.get('type'); // feedback_type filter

    let query = supabase
      .from('newsletter_feedback')
      .select('*')
      .order('responded_at', { ascending: false });

    // Filter by status
    if (status === 'answered') {
      query = query.not('answered_at', 'is', null);
    } else if (status === 'unanswered') {
      query = query.is('answered_at', null);
    }

    // Filter by date
    if (date) {
      query = query.eq('campaign_date', date);
    }

    // Filter by feedback type
    if (feedbackType) {
      query = query.eq('feedback_type', feedbackType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Get summary stats
    const statsQuery = supabase
      .from('newsletter_feedback')
      .select('id, answered_at, feedback_type');

    const { data: statsData } = await statsQuery;

    const stats = {
      total: statsData?.length || 0,
      answered: statsData?.filter(f => f.answered_at).length || 0,
      unanswered: statsData?.filter(f => !f.answered_at).length || 0,
      byType: {
        very_useful: statsData?.filter(f => f.feedback_type === 'very_useful').length || 0,
        useful: statsData?.filter(f => f.feedback_type === 'useful').length || 0,
        not_useful: statsData?.filter(f => f.feedback_type === 'not_useful').length || 0,
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

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('newsletter_feedback')
      .update({
        answered_at: answered ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
