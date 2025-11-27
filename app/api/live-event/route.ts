import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';

// Helper to get PostgREST config
function getPostgRESTConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3001';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // Add /rest/v1 if not already present (works for both cloud and local Supabase)
  const baseURL = url.includes('/rest/v1')
    ? url
    : `${url}/rest/v1`;

  return {
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  };
}

// GET: Read live event data (all events for admin)
export async function GET() {
  // Check authentication using NextAuth
  const authResult = await requireAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const config = getPostgRESTConfig();

    // Get all live events, ordered by event datetime
    const response = await fetch(
      `${config.baseURL}/live_events?select=*&order=event_datetime.desc`,
      {
        method: 'GET',
        headers: config.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error reading live event data:', errorText);

      // If table doesn't exist, return empty array instead of error
      if (errorText.includes('Could not find the table')) {
        return NextResponse.json({ events: [] });
      }

      return NextResponse.json(
        { error: 'Failed to read live event data' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Return empty array if no data exists
    if (!data || data.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Transform database format to frontend format
    const events = data.map((row: any) => ({
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
  // Check authentication and role using NextAuth
  const authResult = await requireAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  // SECURITY: Only owners and admins can create/update live events
  if (authResult.user?.role !== 'owner' && authResult.user?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only owners and admins can manage live events' },
      { status: 403 }
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

    const config = getPostgRESTConfig();

    // If ID is provided, update existing event; otherwise, create new
    if (body.id) {
      // Update existing event
      const response = await fetch(
        `${config.baseURL}/live_events?id=eq.${body.id}`,
        {
          method: 'PATCH',
          headers: config.headers,
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        console.error('Error updating live event data:', await response.text());
        return NextResponse.json(
          { error: 'Failed to update live event data' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Event updated successfully' });
    } else {
      // Create new event
      const response = await fetch(
        `${config.baseURL}/live_events`,
        {
          method: 'POST',
          headers: config.headers,
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        console.error('Error creating live event data:', await response.text());
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
