import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/auth/me
 * Get current user session info
 */
export async function GET(request: NextRequest) {
  try {
    // Check for admin-session cookie
    const sessionCookie = (await cookies()).get('admin-session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    // Verify and decode JWT token
    const payload = await verifyToken(sessionCookie.value);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired session', authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error', authenticated: false },
      { status: 500 }
    );
  }
}
