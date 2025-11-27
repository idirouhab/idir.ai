import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/jwt';
import { isTokenBlacklisted } from './session-blacklist';

type AuthResult =
  | { authorized: false; user: null; response: NextResponse }
  | { authorized: true; user: JWTPayload; response: never };

/**
 * Check if the user is authenticated using custom JWT
 * Use this in API routes to verify authentication
 */
export async function requireAuth(): Promise<AuthResult> {
  const sessionCookie = cookies().get('admin-session');

  if (!sessionCookie) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    } as const;
  }

  const payload = await verifyToken(sessionCookie.value);

  if (!payload) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      )
    } as const;
  }

  // Check if token is blacklisted
  if (payload.jti) {
    const blacklisted = await isTokenBlacklisted(payload.jti);
    if (blacklisted) {
      return {
        authorized: false,
        user: null,
        response: NextResponse.json(
          { error: 'Unauthorized: Session has been revoked' },
          { status: 401 }
        )
      } as const;
    }
  }

  return {
    authorized: true,
    user: payload,
  } as any;
}

/**
 * Check if the user has a specific role
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthResult> {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  if (!authResult.user?.role || !allowedRoles.includes(authResult.user.role)) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: 'Forbidden: insufficient permissions' },
        { status: 403 }
      )
    } as const;
  }

  return authResult;
}
