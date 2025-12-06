import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { supabase } from '@/lib/supabase';

// GET: Read a single live event by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Check authentication using NextAuth
  const authResult = await requireAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error reading live event:', error);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Transform database format to frontend format
    const event = {
      id: data.id,
      isActive: data.is_active,
      title: data.title,
      eventLanguage: data.event_language,
      eventDatetime: data.event_datetime,
      timezone: data.timezone,
      platform: data.platform,
      platformUrl: data.platform_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error reading live event:', error);
    return NextResponse.json(
      { error: 'Failed to read live event' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a live event by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Check authentication and role using NextAuth
  const authResult = await requireAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  // SECURITY: Only owners and admins can delete live events
  if (authResult.user?.role !== 'owner' && authResult.user?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only owners and admins can delete live events' },
      { status: 403 }
    );
  }

  try {
    const { error } = await supabase
      .from('live_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting live event:', error);
      return NextResponse.json(
        { error: 'Failed to delete live event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting live event:', error);
    return NextResponse.json(
      { error: 'Failed to delete live event' },
      { status: 500 }
    );
  }
}
