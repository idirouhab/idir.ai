import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/audit-log';

/**
 * Admin-only API endpoint to export newsletter subscribers as CSV
 * GET /api/newsletter/admin/export
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

    // Only owners and admins can export subscribers
    if (payload.role !== 'owner' && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can export subscribers' },
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

    // Build query (same as the main admin endpoint)
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
      console.error('Error fetching subscribers for export:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // SECURITY: Sanitize CSV fields to prevent CSV injection
    // Fields starting with =, +, -, @ can execute formulas in Excel/Sheets
    const sanitizeCSVField = (field: string): string => {
      const fieldStr = String(field);
      // Prevent CSV injection by prefixing dangerous characters
      if (fieldStr.startsWith('=') || fieldStr.startsWith('+') ||
          fieldStr.startsWith('-') || fieldStr.startsWith('@') ||
          fieldStr.startsWith('\t') || fieldStr.startsWith('\r')) {
        return "'" + fieldStr; // Prefix with single quote to treat as text
      }
      // Escape double quotes by doubling them
      return fieldStr.replace(/"/g, '""');
    };

    // Generate CSV
    const headers = ['Email', 'Language', 'Status', 'Welcomed', 'Created At'];
    const rows = (data || []).map(sub => [
      sanitizeCSVField(sub.email),
      sanitizeCSVField(sub.lang.toUpperCase()),
      sub.is_subscribed ? 'Subscribed' : 'Unsubscribed',
      sub.welcomed ? 'Yes' : 'No',
      new Date(sub.created_at).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Audit log: Track subscriber data export
    await logAuditEvent({
      userId: payload.userId,
      userEmail: payload.email,
      userRole: payload.role,
      action: 'export_subscribers',
      resource: 'newsletter_subscribers',
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: {
        filters: {
          status: filterStatus,
          language: filterLanguage,
          welcomed: filterWelcomed,
        },
        recordsExported: count || 0,
        exportFormat: 'csv',
      },
    });

    // Return CSV file
    const fileName = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/newsletter/admin/export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
