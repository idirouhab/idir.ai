import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const { success, remaining, reset } = await rateLimit(
      `auth:${identifier}`,
      rateLimitConfigs.auth
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfigs.auth.requests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // Validate password strength (only at startup/configuration time)
    // This is to ensure ADMIN_PASSWORD in .env meets minimum requirements
    if (adminPassword.length < 12) {
      console.error('SECURITY WARNING: ADMIN_PASSWORD should be at least 12 characters');
    }

    if (password === adminPassword) {
      // Create a signed JWT token
      const sessionToken = await signToken({ userId: 'admin' });

      // Set cookie with JWT token
      cookies().set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // CSRF protection
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
