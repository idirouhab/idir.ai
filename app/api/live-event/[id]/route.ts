import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

// GET: Read a single live event by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const sessionCookie = cookies().get('admin-session');
  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Verify JWT token
  const payload = await verifyToken(sessionCookie.value);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  // Check authentication
  const sessionCookie = cookies().get('admin-session');
  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Verify JWT token
  const payload = await verifyToken(sessionCookie.value);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { error } = await supabase
      .from('live_events')
      .delete()
      .eq('id', params.id);

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
