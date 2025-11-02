import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

// GET: Read live event data (all events for admin)
export async function GET() {
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
    // Get all live events, ordered by event datetime
    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .order('event_datetime', { ascending: false });

    if (error) {
      console.error('Error reading live event data:', error);
      return NextResponse.json(
        { error: 'Failed to read live event data' },
        { status: 500 }
      );
    }

    // Return empty array if no data exists
    if (!data || data.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Transform database format to frontend format
    const events = data.map(row => ({
      id: row.id,
      isActive: row.is_active,
      title: row.title,
      eventLanguage: row.event_language,
      eventDatetime: row.event_datetime,
      timezone: row.timezone,
      platform: row.platform,
      platformUrl: row.platform_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error reading live event data:', error);
    return NextResponse.json(
      { error: 'Failed to read live event data' },
      { status: 500 }
    );
  }
}

// POST: Create or update live event data
export async function POST(request: Request) {
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
    const body = await request.json();

    // Validate the data structure
    if (
      typeof body.isActive !== 'boolean' ||
      !body.title ||
      !body.eventLanguage ||
      !body.eventDatetime ||
      !body.timezone ||
      !body.platform ||
      !body.platformUrl
    ) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Transform frontend format to database format
    const eventData = {
      is_active: body.isActive,
      title: body.title,
      event_language: body.eventLanguage,
      event_datetime: body.eventDatetime,
      timezone: body.timezone,
      platform: body.platform,
      platform_url: body.platformUrl,
      updated_at: new Date().toISOString(),
    };

    // If ID is provided, update existing event; otherwise, create new
    if (body.id) {
      // Update existing event
      const { error: updateError } = await supabase
        .from('live_events')
        .update(eventData)
        .eq('id', body.id);

      if (updateError) {
        console.error('Error updating live event data:', updateError);
        return NextResponse.json(
          { error: 'Failed to update live event data' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Event updated successfully' });
    } else {
      // Create new event
      const { error: insertError } = await supabase
        .from('live_events')
        .insert([eventData]);

      if (insertError) {
        console.error('Error creating live event data:', insertError);
        return NextResponse.json(
          { error: 'Failed to create live event data' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Event created successfully' });
    }
  } catch (error) {
    console.error('Error saving live event data:', error);
    return NextResponse.json(
      { error: 'Failed to save live event data' },
      { status: 500 }
    );
  }
}
