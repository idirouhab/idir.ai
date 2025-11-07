import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';

// Get current authenticated user info
export async function GET(request: NextRequest) {
  try {
    const user = await checkAuth(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
