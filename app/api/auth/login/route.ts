import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/jwt';
import { rateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';
// Use direct PostgREST client for local development
import { authenticateUser } from '@/lib/users-postgrest';

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

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user with email/password
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Create a signed JWT token
    const sessionToken = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Set cookie with JWT token
    cookies().set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // CSRF protection
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
