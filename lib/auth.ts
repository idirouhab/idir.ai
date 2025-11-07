import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload, UserRole } from './jwt';
import { isTokenBlacklisted } from './session-blacklist';

export async function checkAuth(request: NextRequest): Promise<JWTPayload | null> {
  const sessionCookie = request.cookies.get('admin-session');
  if (!sessionCookie) {
    return null;
  }

  const payload = await verifyToken(sessionCookie.value);
  if (!payload) {
    return null;
  }

  // SECURITY: Check if token is blacklisted (API routes only)
  if (payload.jti) {
    const blacklisted = await isTokenBlacklisted(payload.jti);
    if (blacklisted) {
      return null;
    }
  }

  return payload;
}

export async function checkAuthFromCookies(): Promise<JWTPayload | null> {
  const sessionCookie = cookies().get('admin-session');
  if (!sessionCookie) {
    return null;
  }

  const payload = await verifyToken(sessionCookie.value);
  if (!payload) {
    return null;
  }

  // SECURITY: Check if token is blacklisted (API routes only)
  if (payload.jti) {
    const blacklisted = await isTokenBlacklisted(payload.jti);
    if (blacklisted) {
      return null;
    }
  }

  return payload;
}

export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const user = await checkAuth(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(request: NextRequest, allowedRoles: UserRole[]): Promise<JWTPayload> {
  const user = await requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: insufficient permissions');
  }
  return user;
}

export function isOwner(user: JWTPayload | null): boolean {
  return user?.role === 'owner';
}

export function canPublish(user: JWTPayload | null): boolean {
  return user?.role === 'owner' || user?.role === 'admin';
}
