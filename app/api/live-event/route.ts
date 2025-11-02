import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

// GET: Read the live event data
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
    // Get the first (and only) row from live_events table
    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error reading live event data:', error);
      return NextResponse.json(
        { error: 'Failed to read live event data' },
        { status: 500 }
      );
    }

    // Transform database format to frontend format
    const responseData = {
      isActive: data.is_active,
      en: {
        title: data.en_title,
        date: data.en_date,
        time: data.en_time,
        platform: data.en_platform,
        platformUrl: data.en_platform_url,
      },
      es: {
        title: data.es_title,
        date: data.es_date,
        time: data.es_time,
        platform: data.es_platform,
        platformUrl: data.es_platform_url,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error reading live event data:', error);
    return NextResponse.json(
      { error: 'Failed to read live event data' },
      { status: 500 }
    );
  }
}

// POST: Update the live event data
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
    if (typeof body.isActive !== 'boolean' || !body.en || !body.es) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Transform frontend format to database format
    const updateData = {
      is_active: body.isActive,
      en_title: body.en.title,
      en_date: body.en.date,
      en_time: body.en.time,
      en_platform: body.en.platform,
      en_platform_url: body.en.platformUrl,
      es_title: body.es.title,
      es_date: body.es.date,
      es_time: body.es.time,
      es_platform: body.es.platform,
      es_platform_url: body.es.platformUrl,
      updated_at: new Date().toISOString(),
    };

    // Get the first row's ID
    const { data: existingData, error: selectError } = await supabase
      .from('live_events')
      .select('id')
      .limit(1)
      .single();

    if (selectError) {
      console.error('Error finding live event:', selectError);
      return NextResponse.json(
        { error: 'Failed to find live event' },
        { status: 500 }
      );
    }

    // Update the row
    const { error: updateError } = await supabase
      .from('live_events')
      .update(updateData)
      .eq('id', existingData.id);

    if (updateError) {
      console.error('Error updating live event data:', updateError);
      return NextResponse.json(
        { error: 'Failed to update live event data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating live event data:', error);
    return NextResponse.json(
      { error: 'Failed to update live event data' },
      { status: 500 }
    );
  }
}
