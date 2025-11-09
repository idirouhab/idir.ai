import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
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
    // Check authentication
    const sessionCookie = cookies().get('admin-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owners and admins can access subscribers
    if (payload.role !== 'owner' && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can access subscribers' },
        { status: 403 }
      );
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

    // Get statistics
    const { data: stats } = await supabase
      .from('newsletter_subscribers')
      .select('lang, is_subscribed, welcomed');

    const statistics = {
      total: count || 0,
      subscribed: stats?.filter(s => s.is_subscribed).length || 0,
      unsubscribed: stats?.filter(s => !s.is_subscribed).length || 0,
      en: stats?.filter(s => s.lang === 'en').length || 0,
      es: stats?.filter(s => s.lang === 'es').length || 0,
      welcomed: stats?.filter(s => s.welcomed).length || 0,
      notWelcomed: stats?.filter(s => !s.welcomed).length || 0,
    };

    // Audit log: Track subscriber data access
    await logAuditEvent({
      userId: payload.userId,
      userEmail: payload.email,
      userRole: payload.role,
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
      data,
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
