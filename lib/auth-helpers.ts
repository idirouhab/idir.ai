import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Check if the user is authenticated using NextAuth
 * Use this in API routes to verify authentication
 */
export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }

  return {
    authorized: true,
    user: session.user,
    response: null
  };
}

/**
 * Check if the user has a specific role
 */
export async function requireRole(allowedRoles: string[]) {
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
    };
  }

  return authResult;
}
