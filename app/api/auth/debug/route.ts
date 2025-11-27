import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  // SECURITY: Disable debug endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    );
  }

  try {
    const session = await auth();

    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      user: session?.user ? {
        email: session.user.email,
        role: session.user.role,
      } : null,
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
