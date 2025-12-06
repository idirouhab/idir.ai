import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type SubscriberWithFeedback = {
  email: string;
  lang: string;
  created_at: string;
  feedbackCount?: number;
  lastFeedbackSent?: string | null;
  daysSinceLastFeedback?: number | null;
};

/**
 * Preview campaign recipients with filters
 * GET /api/newsletter/feedback/preview?lang=all&minDaysSubscribed=0&excludeRecentFeedbackDays=30
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

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'all';
    const minDaysSubscribed = parseInt(searchParams.get('minDaysSubscribed') || '0');
    const excludeRecentFeedbackDays = parseInt(searchParams.get('excludeRecentFeedbackDays') || '0');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active subscribers with basic filters
    let subscribersQuery = supabase
      .from('newsletter_subscribers')
      .select('email, lang, created_at')
      .eq('is_subscribed', true);

    if (lang !== 'all') {
      subscribersQuery = subscribersQuery.eq('lang', lang);
    }

    // Apply min days subscribed filter
    if (minDaysSubscribed > 0) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - minDaysSubscribed);
      subscribersQuery = subscribersQuery.lte('created_at', minDate.toISOString());
    }

    const { data: subscribers, error: fetchError } = await subscribersQuery;

    if (fetchError) {
      console.error('Error fetching subscribers:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    let filteredSubscribers: SubscriberWithFeedback[] = subscribers || [];

    // Get feedback counts for all subscribers
    const { data: allFeedback } = await supabase
      .from('newsletter_feedback')
      .select('subscriber_email, sent_at');

    // Create a map of email -> feedback data
    const feedbackMap = new Map<string, { count: number; lastSent: string | null; daysSince: number | null }>();

    if (allFeedback) {
      allFeedback.forEach(f => {
        const existing = feedbackMap.get(f.subscriber_email) || { count: 0, lastSent: null, daysSince: null };
        existing.count++;
        if (f.sent_at && (!existing.lastSent || new Date(f.sent_at) > new Date(existing.lastSent))) {
          existing.lastSent = f.sent_at;
          existing.daysSince = Math.floor((new Date().getTime() - new Date(f.sent_at).getTime()) / (1000 * 60 * 60 * 24));
        }
        feedbackMap.set(f.subscriber_email, existing);
      });
    }

    // Add feedback count to each subscriber
    filteredSubscribers = filteredSubscribers.map(sub => ({
      ...sub,
      feedbackCount: feedbackMap.get(sub.email)?.count || 0,
      lastFeedbackSent: feedbackMap.get(sub.email)?.lastSent || null,
      daysSinceLastFeedback: feedbackMap.get(sub.email)?.daysSince || null,
    }));

    // If we need to exclude recent feedback, filter based on lastFeedbackSent
    if (excludeRecentFeedbackDays > 0 && filteredSubscribers.length > 0) {
      const excludeAfterDate = new Date();
      excludeAfterDate.setDate(excludeAfterDate.getDate() - excludeRecentFeedbackDays);

      filteredSubscribers = filteredSubscribers.filter(sub =>
        !sub.lastFeedbackSent || new Date(sub.lastFeedbackSent) < excludeAfterDate
      );
    }

    return NextResponse.json({
      success: true,
      subscribers: filteredSubscribers,
      total: filteredSubscribers.length,
    });
  } catch (error) {
    console.error('Error in GET /api/newsletter/feedback/preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
