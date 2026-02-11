import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { isAdmin, primaryAdminRole } from '@/lib/app-roles';
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/audit-log';
import { query } from '@/lib/db';

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
    const sessionCookie = (await cookies()).get('admin-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owners and admins can export subscribers
    if (!isAdmin(payload.roles)) {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and billing admins can export subscribers' },
        { status: 403 }
      );
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

    const result = await query(
      `SELECT *, COUNT(*) OVER()::int AS total_count
       FROM newsletter_subscribers
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    const data = result.rows;
    const count = data.length > 0 ? data[0].total_count : 0;

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
      userRole: (primaryAdminRole(payload.roles) || 'viewer') as any,
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
