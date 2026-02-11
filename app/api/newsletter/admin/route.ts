import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/audit-log';
import { primaryAdminRole } from '@/lib/app-roles';
import { query } from '@/lib/db';

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
    const authResult = await requireRole(['super_admin', 'billing_admin']);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('filter') || 'all';
    const filterLanguage = searchParams.get('lang') || 'all';
    const filterWelcomed = searchParams.get('welcomed') || 'all';

    const where: string[] = [];
    const params: any[] = [];

    if (filterStatus === 'subscribed') {
      params.push(true);
      where.push(`is_subscribed = $${params.length}`);
    } else if (filterStatus === 'unsubscribed') {
      params.push(false);
      where.push(`is_subscribed = $${params.length}`);
    }

    if (filterLanguage === 'en' || filterLanguage === 'es') {
      params.push(filterLanguage);
      where.push(`lang = $${params.length}`);
    }

    if (filterWelcomed === 'true') {
      params.push(true);
      where.push(`welcomed = $${params.length}`);
    } else if (filterWelcomed === 'false') {
      params.push(false);
      where.push(`welcomed = $${params.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const subscribersResult = await query(
      `SELECT *, COUNT(*) OVER()::int AS total_count
       FROM newsletter_subscribers
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    const data = subscribersResult.rows;
    const count = data.length > 0 ? data[0].total_count : 0;

    // Get feedback email tracking info for all subscribers
    const feedbackResult = await query(
      `SELECT subscriber_email, sent_at, campaign_date
       FROM newsletter_feedback
       WHERE sent_at IS NOT NULL
       ORDER BY sent_at DESC`
    );
    const feedbackData = feedbackResult.rows;

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
    const statsResult = await query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE is_subscribed) ::int AS subscribed,
         COUNT(*) FILTER (WHERE NOT is_subscribed) ::int AS unsubscribed,
         COUNT(*) FILTER (WHERE lang = 'en') ::int AS en,
         COUNT(*) FILTER (WHERE lang = 'es') ::int AS es,
         COUNT(*) FILTER (WHERE welcomed) ::int AS welcomed,
         COUNT(*) FILTER (WHERE NOT welcomed) ::int AS notwelcomed,
         COUNT(*) FILTER (WHERE subscribe_newsletter) ::int AS newslettersubscribers,
         COUNT(*) FILTER (WHERE subscribe_podcast) ::int AS podcastsubscribers
       FROM newsletter_subscribers`
    );
    const statsRow = statsResult.rows[0] || {};
    const feedbackCountResult = await query(
      `SELECT COUNT(DISTINCT subscriber_email)::int AS feedback_sent
       FROM newsletter_feedback
       WHERE sent_at IS NOT NULL`
    );
    const feedbackSent = feedbackCountResult.rows[0]?.feedback_sent || 0;

    const statistics = {
      total: statsRow.total || 0,
      subscribed: statsRow.subscribed || 0,
      unsubscribed: statsRow.unsubscribed || 0,
      en: statsRow.en || 0,
      es: statsRow.es || 0,
      welcomed: statsRow.welcomed || 0,
      notWelcomed: statsRow.notwelcomed || 0,
      feedbackSent,
      feedbackNotSent: (statsRow.total || 0) - feedbackSent,
      newsletterSubscribers: statsRow.newslettersubscribers || 0,
      podcastSubscribers: statsRow.podcastsubscribers || 0,
    };

    // Audit log: Track subscriber data access
    await logAuditEvent({
      userId: authResult.user?.userId || '',
      userEmail: authResult.user?.email || '',
      userRole: (primaryAdminRole(authResult.user?.roles) || 'viewer') as any,
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
