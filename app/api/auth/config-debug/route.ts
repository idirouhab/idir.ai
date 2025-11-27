import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check auth configuration
 * GET /api/auth/config-debug
 */
export async function GET() {
  const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
  const nodeEnv = process.env.NODE_ENV;

  return NextResponse.json({
    environment: {
      NODE_ENV: nodeEnv,
      NEXTAUTH_URL: authUrl,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    },
    expectedRedirectUri: `${authUrl}/api/auth/callback/google`,
    hints: {
      cookieSecure: nodeEnv === 'production',
      basePath: '/api/auth',
    }
  });
}
