import type { AppRole } from './app-roles';
import { query } from '@/lib/db';

export type AuditAction =
  | 'view_subscribers'
  | 'export_subscribers'
  | 'view_subscriber_details'
  | 'update_subscriber'
  | 'delete_subscriber';

export type AuditLogEntry = {
  userId: string;
  userEmail: string;
  userRole: AppRole | null;
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
    await query(
      `INSERT INTO audit_logs (
        user_id, user_email, user_role, action, resource, resource_id,
        ip_address, user_agent, metadata, success, error_message
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        entry.userId,
        entry.userEmail,
        entry.userRole,
        entry.action,
        entry.resource,
        entry.resourceId || null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.metadata || null,
        entry.success ?? true,
        entry.errorMessage || null,
      ]
    );
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
