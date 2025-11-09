import { createClient } from '@supabase/supabase-js';
import { UserRole } from './jwt';

export type AuditAction =
  | 'view_subscribers'
  | 'export_subscribers'
  | 'view_subscriber_details'
  | 'update_subscriber'
  | 'delete_subscriber';

export type AuditLogEntry = {
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
};

/**
 * Log an audit event to the database
 * Used for tracking sensitive data access and modifications
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials for audit logging');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('audit_logs').insert({
      user_id: entry.userId,
      user_email: entry.userEmail,
      user_role: entry.userRole,
      action: entry.action,
      resource: entry.resource,
      resource_id: entry.resourceId,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      metadata: entry.metadata,
      success: entry.success ?? true,
      error_message: entry.errorMessage,
    });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    // Don't throw - audit logging failures shouldn't break the main flow
    console.error('Error in audit logging:', error);
  }
}

/**
 * Extract client IP address from request
 */
export function getClientIP(request: Request): string | undefined {
  // Check common headers for IP address (in order of reliability)
  const headers = request.headers;

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;

  // Standard forwarded headers
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first (client)
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) return xRealIP;

  return undefined;
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}
