import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { listUsers, updateUserStatus, updateUserRole, updateUserDetails, getUserById } from '@/lib/users';
import { UserRole } from '@/lib/jwt';

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

// Update user status (owner only)
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

// Update user role or details (owner only)
export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await requireAuth(request);

    // Only owners can change roles or details
    if (currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden: Owner access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role, name, email, linkedin_url, twitter_url } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // SECURITY: Prevent changing own role
    if (userId === currentUser.userId) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 403 }
      );
    }

    // SECURITY: Prevent demoting the last owner
    if (targetUser.role === 'owner' && role && role !== 'owner') {
      return NextResponse.json(
        { error: 'Cannot demote the owner role' },
        { status: 403 }
      );
    }

    let user = targetUser;

    // Update role if provided
    if (role && ['owner', 'admin', 'blogger'].includes(role)) {
      user = await updateUserRole(userId, role as UserRole);
    }

    // Update details if provided
    if (name || email || linkedin_url !== undefined || twitter_url !== undefined) {
      const updates: { name?: string; email?: string; linkedin_url?: string; twitter_url?: string } = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
      if (twitter_url !== undefined) updates.twitter_url = twitter_url;
      user = await updateUserDetails(userId, updates);
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/users:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Owner access required' }, { status: 403 });
    }

    // Handle duplicate email error
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
