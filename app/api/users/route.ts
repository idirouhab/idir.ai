import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { listUsers, updateUserStatus } from '@/lib/users';

// List all users (owner only)
export async function GET(request: NextRequest) {
  try {
    // Only owners can list users
    await requireRole(request, ['owner']);

    const users = await listUsers();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/users:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user (owner only)
export async function PATCH(request: NextRequest) {
  try {
    // Only owners can update users
    await requireRole(request, ['owner']);

    const { userId, isActive } = await request.json();

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and isActive are required' },
        { status: 400 }
      );
    }

    const user = await updateUserStatus(userId, isActive);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/users:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
