import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/audit-log';

/**
 * Admin-only API endpoint to get newsletter subscribers
 * GET /api/newsletter/admin
 *
 * Query params:
 * - filter: 'all' | 'subscribed' | 'unsubscribed' (default: 'all')
 * - lang: 'all' | 'en' | 'es' (default: 'all')
 * - welcomed: 'all' | 'true' | 'false' (default: 'all')
 */
export async function GET(request: Request) {
  try {
    // Check authentication and role using NextAuth
    const authResult = await requireRole(['owner', 'admin']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('filter') || 'all';
    const filterLanguage = searchParams.get('lang') || 'all';
    const filterWelcomed = searchParams.get('welcomed') || 'all';

    // Build query
    let query = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filterStatus === 'subscribed') {
      query = query.eq('is_subscribed', true);
    } else if (filterStatus === 'unsubscribed') {
      query = query.eq('is_subscribed', false);
    }

    if (filterLanguage === 'en' || filterLanguage === 'es') {
      query = query.eq('lang', filterLanguage);
    }

    if (filterWelcomed === 'true') {
      query = query.eq('welcomed', true);
    } else if (filterWelcomed === 'false') {
      query = query.eq('welcomed', false);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching subscribers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Get feedback email tracking info for all subscribers
    const { data: feedbackData } = await supabase
      .from('newsletter_feedback')
      .select('subscriber_email, sent_at, campaign_date')
      .not('sent_at', 'is', null)
      .order('sent_at', { ascending: false });

    // Create a map of email -> most recent feedback sent date
    const feedbackMap = new Map<string, { sent_at: string; campaign_date: string }>();
    if (feedbackData) {
      for (const feedback of feedbackData) {
        if (!feedbackMap.has(feedback.subscriber_email)) {
          feedbackMap.set(feedback.subscriber_email, {
            sent_at: feedback.sent_at,
            campaign_date: feedback.campaign_date,
          });
        }
      }
    }

    // Add feedback info to subscribers
    const subscribersWithFeedback = data?.map(subscriber => ({
      ...subscriber,
      feedback_sent_at: feedbackMap.get(subscriber.email)?.sent_at || null,
      feedback_campaign_date: feedbackMap.get(subscriber.email)?.campaign_date || null,
    }));

    // Get statistics
    const { data: stats } = await supabase
      .from('newsletter_subscribers')
      .select('lang, is_subscribed, welcomed, subscribe_newsletter, subscribe_podcast');

    const statistics = {
      total: count || 0,
      subscribed: stats?.filter(s => s.is_subscribed).length || 0,
      unsubscribed: stats?.filter(s => !s.is_subscribed).length || 0,
      en: stats?.filter(s => s.lang === 'en').length || 0,
      es: stats?.filter(s => s.lang === 'es').length || 0,
      welcomed: stats?.filter(s => s.welcomed).length || 0,
      notWelcomed: stats?.filter(s => !s.welcomed).length || 0,
      feedbackSent: feedbackMap.size,
      feedbackNotSent: (count || 0) - feedbackMap.size,
      newsletterSubscribers: stats?.filter(s => s.subscribe_newsletter).length || 0,
      podcastSubscribers: stats?.filter(s => s.subscribe_podcast).length || 0,
    };

    // Audit log: Track subscriber data access
    await logAuditEvent({
      userId: authResult.user?.id || '',
      userEmail: authResult.user?.email || '',
      userRole: (authResult.user?.role || 'viewer') as any,
      action: 'view_subscribers',
      resource: 'newsletter_subscribers',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: {
        filters: {
          status: filterStatus,
          language: filterLanguage,
          welcomed: filterWelcomed,
        },
        recordsReturned: count || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: subscribersWithFeedback,
      count,
      statistics,
    });
  } catch (error) {
    console.error('Error in GET /api/newsletter/admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
