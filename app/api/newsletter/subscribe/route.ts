import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema
const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  language: z.enum(['en', 'es']).default('en'),
  action: z.enum(['subscribe', 'unsubscribe', 'update_preferences', 'get_preferences']).default('subscribe'),
  preferences: z.object({
    newsletter: z.boolean().optional(),
    podcast: z.boolean().optional(),
  }).optional(),
});

/**
 * Public API endpoint for newsletter subscriptions
 * POST /api/newsletter/subscribe
 *
 * Body: { email: string, language: 'en' | 'es', action: 'subscribe' | 'unsubscribe' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = SubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.issues.map(i => i.message),
        },
        { status: 400 }
      );
    }

    const { email, language, action, preferences } = validation.data;

    // Initialize Supabase client with anon key
    // Note: Make sure SELECT policy exists on newsletter_subscribers table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { success: false, error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get preferences action
    if (action === 'get_preferences') {
      console.log('Getting preferences for email:', email.toLowerCase());

      try {
        const response = await fetch(
          `${supabaseUrl}/newsletter_subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}&select=lang,subscribe_newsletter,subscribe_podcast`,
          {
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('PostgREST response status:', response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error('PostgREST error:', error);
          return NextResponse.json(
            { success: false, error: 'Subscriber not found' },
            { status: 404 }
          );
        }

        const data = await response.json();
        if (!data || data.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Subscriber not found' },
            { status: 404 }
          );
        }

        const subscriber = data[0];
        return NextResponse.json({
          success: true,
          lang: subscriber.lang,
          subscribe_newsletter: subscriber.subscribe_newsletter,
          subscribe_podcast: subscriber.subscribe_podcast,
        });
      } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json(
          { success: false, error: 'Subscriber not found' },
          { status: 404 }
        );
      }
    }

    // Update preferences action
    if (action === 'update_preferences') {
      console.log('Update preferences for:', email.toLowerCase(), 'preferences:', preferences);

      if (!preferences) {
        return NextResponse.json(
          { success: false, error: 'Preferences are required' },
          { status: 400 }
        );
      }

      try {
        // Check if user exists first
        const checkUrl = `${supabaseUrl}/newsletter_subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}&select=id`;
        console.log('Check URL:', checkUrl);

        const checkResponse = await fetch(checkUrl, {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          }
        });

        console.log('Check response status:', checkResponse.status);

        if (!checkResponse.ok) {
          const error = await checkResponse.json();
          console.error('Check response error:', error);
          return NextResponse.json(
            { success: false, error: 'Email not found in our list' },
            { status: 404 }
          );
        }

        const existing = await checkResponse.json();
        console.log('Existing user:', existing);

        if (!existing || existing.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Email not found in our list' },
            { status: 404 }
          );
        }

        // Check if at least one preference is true
        const hasActiveSubscription = preferences.newsletter || preferences.podcast;

        // Update preferences
        const updateResponse = await fetch(
          `${supabaseUrl}/newsletter_subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              subscribe_newsletter: preferences.newsletter ?? false,
              subscribe_podcast: preferences.podcast ?? false,
              is_subscribed: hasActiveSubscription,
              lang: language,
              updated_at: new Date().toISOString(),
            })
          }
        );

        if (!updateResponse.ok) {
          const error = await updateResponse.json();
          console.error('Error updating preferences:', error);
          return NextResponse.json(
            { success: false, error: 'Failed to update preferences' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Preferences updated successfully!',
          status: 'updated',
        });
      } catch (error) {
        console.error('Error in update_preferences:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update preferences' },
          { status: 500 }
        );
      }
    }

    if (action === 'subscribe') {
      // Check if already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_subscribed')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        // Re-subscribe if previously unsubscribed
        if (!existing.is_subscribed) {
          const updateData: any = {
            is_subscribed: true,
            lang: language,
            updated_at: new Date().toISOString(),
          };

          // Apply preferences if provided
          if (preferences) {
            updateData.subscribe_newsletter = preferences.newsletter ?? true;
            updateData.subscribe_podcast = preferences.podcast ?? false;
          }

          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update(updateData)
            .eq('id', existing.id);

          if (updateError) {
            console.error('Error re-subscribing:', updateError);
            return NextResponse.json(
              { success: false, error: 'Subscription failed' },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: 'Successfully re-subscribed!',
            status: 'resubscribed',
          });
        }

        // Already subscribed - update preferences if provided
        if (preferences) {
          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({
              subscribe_newsletter: preferences.newsletter ?? true,
              subscribe_podcast: preferences.podcast ?? false,
              lang: language,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error('Error updating preferences:', updateError);
          }
        }

        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!',
          status: 'already_subscribed',
        });
      }

      // New subscriber
      const insertData: any = {
        email: email.toLowerCase(),
        lang: language,
        is_subscribed: true,
        welcomed: false,
      };

      // Apply preferences if provided, otherwise use defaults
      if (preferences) {
        insertData.subscribe_newsletter = preferences.newsletter ?? true;
        insertData.subscribe_podcast = preferences.podcast ?? false;
      } else {
        // Default: newsletter enabled
        insertData.subscribe_newsletter = true;
        insertData.subscribe_podcast = false;
      }

      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert(insertData);

      if (insertError) {
        console.error('Error subscribing:', insertError);
        return NextResponse.json(
          { success: false, error: 'Subscription failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed!',
        status: 'subscribed',
      });
    } else {
      // Unsubscribe - check if user exists first
      console.log('Unsubscribe action for:', email.toLowerCase());

      try {
        const checkResponse = await fetch(
          `${supabaseUrl}/newsletter_subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}&select=id,is_subscribed`,
          {
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Check response status:', checkResponse.status);

        if (!checkResponse.ok) {
          const error = await checkResponse.json();
          console.error('Check response error:', error);
          return NextResponse.json(
            { success: false, error: 'Email not found in our list' },
            { status: 404 }
          );
        }

        const existingData = await checkResponse.json();
        console.log('Existing user data:', existingData);

        if (!existingData || existingData.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Email not found in our list' },
            { status: 404 }
          );
        }

        const existing = existingData[0];

        // Unsubscribe from all - set all preferences to false
        const updateResponse = await fetch(
          `${supabaseUrl}/newsletter_subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              is_subscribed: false,
              subscribe_newsletter: false,
              subscribe_podcast: false,
              updated_at: new Date().toISOString(),
            })
          }
        );

        console.log('Update response status:', updateResponse.status);

        if (!updateResponse.ok) {
          const error = await updateResponse.json();
          console.error('Error unsubscribing:', error);
          return NextResponse.json(
            { success: false, error: 'Unsubscription failed' },
            { status: 500 }
          );
        }

        // Return appropriate message
        const message = !existing.is_subscribed
          ? 'Already unsubscribed'
          : 'Successfully unsubscribed!';
        const statusText = !existing.is_subscribed
          ? 'already_unsubscribed'
          : 'unsubscribed';

        return NextResponse.json({
          success: true,
          message,
          status: statusText,
        });
      } catch (error) {
        console.error('Error in unsubscribe:', error);
        return NextResponse.json(
          { success: false, error: 'Unsubscription failed' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
