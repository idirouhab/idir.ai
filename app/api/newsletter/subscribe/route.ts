import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema
const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  language: z.enum(['en', 'es']).default('en'),
  action: z.enum(['subscribe', 'unsubscribe']).default('subscribe'),
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

    const { email, language, action } = validation.data;

    // Initialize Supabase client
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
          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({
              is_subscribed: true,
              lang: language,
              updated_at: new Date().toISOString(),
            })
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

        // Already subscribed
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!',
          status: 'already_subscribed',
        });
      }

      // New subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          lang: language,
          is_subscribed: true,
          welcomed: false,
        });

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
      // Unsubscribe
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_subscribed: false,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email.toLowerCase());

      if (updateError) {
        console.error('Error unsubscribing:', updateError);
        return NextResponse.json(
          { success: false, error: 'Unsubscription failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully unsubscribed!',
        status: 'unsubscribed',
      });
    }
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
