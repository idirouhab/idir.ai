import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { blacklistToken } from '@/lib/session-blacklist';

export async function POST() {
  try {
    // Get the session token before deleting it
    const sessionCookie = cookies().get('admin-session');

    if (sessionCookie) {
      // Verify and extract token information
      const payload = await verifyToken(sessionCookie.value);

      if (payload && payload.jti && payload.exp) {
        // Add token to blacklist with its expiration time
        const expiresAt = new Date(payload.exp * 1000); // Convert Unix timestamp to Date
        const result = await blacklistToken(payload.jti, payload.userId, expiresAt, 'logout');

        if (!result.success) {
          console.error('Failed to blacklist token:', result.error);
          // Continue with logout even if blacklisting fails
        }
      }
    }

    // Delete the session cookie
    cookies().delete('admin-session');

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);

    // Delete cookie even if there's an error
    cookies().delete('admin-session');

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  }
}
