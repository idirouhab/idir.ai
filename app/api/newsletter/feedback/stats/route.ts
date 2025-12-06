import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Get feedback statistics for admin
 * GET /api/newsletter/feedback/stats?date=2024-01-15
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = (await cookies()).get('admin-session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const campaignDate = searchParams.get('date');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get total subscribers count
    const { count: totalSubscribers } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_subscribed', true);

    let feedbackQuery = supabase.from('newsletter_feedback').select('*');

    // Filter by date if provided
    if (campaignDate) {
      feedbackQuery = feedbackQuery.eq('campaign_date', campaignDate);
    }

    const { data: feedbackData, error: feedbackError } = await feedbackQuery;

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalResponses = feedbackData?.length || 0;
    const responseRate = totalSubscribers ? ((totalResponses / totalSubscribers) * 100).toFixed(2) : '0';

    const breakdown = {
      very_useful: feedbackData?.filter(f => f.feedback_type === 'very_useful').length || 0,
      useful: feedbackData?.filter(f => f.feedback_type === 'useful').length || 0,
      not_useful: feedbackData?.filter(f => f.feedback_type === 'not_useful').length || 0,
    };

    // Group by date for historical view
    const byDate = feedbackData?.reduce((acc: any, curr: any) => {
      const date = curr.campaign_date;
      if (!acc[date]) {
        acc[date] = { very_useful: 0, useful: 0, not_useful: 0, total: 0 };
      }
      acc[date][curr.feedback_type]++;
      acc[date].total++;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers: totalSubscribers || 0,
        totalResponses,
        responseRate: parseFloat(responseRate),
        breakdown,
        byDate: byDate || {},
        recentResponses: feedbackData?.slice(0, 10) || [],
      },
    });
  } catch (error) {
    console.error('Error in feedback stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
