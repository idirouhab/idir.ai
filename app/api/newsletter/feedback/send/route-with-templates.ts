import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { generateFeedbackToken } from '@/lib/feedback-token';
import { getTranslations } from 'next-intl/server';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Send feedback survey to subscribers using Mailgun templates
 * POST /api/newsletter/feedback/send
 * Body: {
 *   testEmail?: string,  // If provided, only sends to this email for testing
 *   selectedEmails?: string[],  // If provided, only sends to these emails
 *   lang?: 'en' | 'es' | 'all',  // Language filter (only used if no selectedEmails)
 *   campaignDate?: string,
 *   minDaysSubscribed?: number,  // Only send to subscribers who joined X+ days ago
 *   excludeRecentFeedbackDays?: number  // Don't send to subscribers who received feedback in last X days
 * }
 *
 * IMPORTANT: You must create ONE template in Mailgun dashboard:
 * - Template name: feedback-survey (single template for all languages)
 *
 * All translations are managed in messages/en.json and messages/es.json (next-intl)
 * See docs/MAILGUN_FEEDBACK_TEMPLATE_SIMPLE.md for template HTML
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = (await cookies()).get('admin-session');
    if (!sessionCookie) {
      console.error('[Auth] No admin-session cookie found');
      return NextResponse.json({ error: 'Unauthorized: No session cookie found' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      console.error('[Auth] Invalid or expired token');
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
    }

    console.log('[Auth] Authenticated user:', payload.email, 'role:', payload.role);

    const body = await request.json();
    const testEmail = body.testEmail;
    const selectedEmails = body.selectedEmails || [];
    const lang = body.lang || 'all';
    const campaignDate = body.campaignDate || new Date().toISOString().split('T')[0];
    const minDaysSubscribed = body.minDaysSubscribed || 0;
    const excludeRecentFeedbackDays = body.excludeRecentFeedbackDays || 0;

    const supabase = createClient(supabaseUrl, supabaseKey);

    let subscribers;

    // Test mode: send to a single test email
    if (testEmail) {
      // For test email, we'll use 'en' as default language
      subscribers = [{ email: testEmail, lang: 'en' }];
    }
    // Selected subscribers mode
    else if (selectedEmails.length > 0) {
      const { data, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('email, lang, created_at')
        .eq('is_subscribed', true)
        .in('email', selectedEmails);

      if (fetchError) {
        console.error('Error fetching selected subscribers:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch subscribers' },
          { status: 500 }
        );
      }

      subscribers = data;
    }
    // All subscribers with optional filters
    else {
      // First, get all active subscribers with basic filters
      let subscribersQuery = supabase
        .from('newsletter_subscribers')
        .select('email, lang, created_at')
        .eq('is_subscribed', true);

      if (lang !== 'all') {
        subscribersQuery = subscribersQuery.eq('lang', lang);
      }

      // Apply min days subscribed filter
      if (minDaysSubscribed > 0) {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - minDaysSubscribed);
        subscribersQuery = subscribersQuery.lte('created_at', minDate.toISOString());
      }

      const { data, error: fetchError } = await subscribersQuery;

      if (fetchError) {
        console.error('Error fetching subscribers:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch subscribers' },
          { status: 500 }
        );
      }

      subscribers = data || [];

      // If we need to exclude recent feedback, fetch that data and filter
      if (excludeRecentFeedbackDays > 0 && subscribers.length > 0) {
        const excludeAfterDate = new Date();
        excludeAfterDate.setDate(excludeAfterDate.getDate() - excludeRecentFeedbackDays);

        const { data: recentFeedback } = await supabase
          .from('newsletter_feedback')
          .select('subscriber_email')
          .gte('sent_at', excludeAfterDate.toISOString());

        if (recentFeedback && recentFeedback.length > 0) {
          const recentEmails = new Set(recentFeedback.map(f => f.subscriber_email));
          subscribers = subscribers.filter(sub => !recentEmails.has(sub.email));
        }
      }
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers found' },
        { status: 404 }
      );
    }

    // Initialize Mailgun client
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '',
      url: process.env.MAILGUN_API_URL || 'https://api.mailgun.net',
    });

    const mailgunDomain = process.env.MAILGUN_DOMAIN || 'idir.ai';

    // Template name (single template for all languages)
    const TEMPLATE_NAME = process.env.MAILGUN_FEEDBACK_TEMPLATE || 'feedback-survey';

    // Send emails to all subscribers
    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const subscriber of subscribers) {
      try {
        // Double-check subscription status (safety check)
        if (!testEmail) {
          const { data: subCheck } = await supabase
            .from('newsletter_subscribers')
            .select('is_subscribed')
            .eq('email', subscriber.email)
            .single();

          if (!subCheck?.is_subscribed) {
            console.log(`Skipping ${subscriber.email} - not subscribed`);
            results.failed++;
            results.errors.push(`${subscriber.email}: User is unsubscribed`);
            continue;
          }
        }

        // Generate feedback token
        const token = await generateFeedbackToken({
          email: subscriber.email,
          campaignDate: campaignDate,
        });

        // Get translations for subscriber's language using next-intl
        const lang = subscriber.lang === 'es' ? 'es' : 'en';
        const t = await getTranslations({ locale: lang, namespace: 'feedbackEmail' });

        // Prepare template variables (includes all translations)
        const templateVariables = {
          // System variables
          token: token,
          subscriber_email: subscriber.email,
          unsubscribe_url: `https://idir.ai/${lang}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,

          // All translated content from next-intl
          title: t('title'),
          systemStatusLabel: t('systemStatusLabel'),
          systemStatusOnline: t('systemStatusOnline'),
          terminalLine1: t('terminalLine1'),
          terminalLine2: t('terminalLine2'),
          introText: t('introText'),
          calibrationModuleLabel: t('calibrationModuleLabel'),
          question: t('question'),
          strongSignalLabel: t('strongSignalLabel'),
          strongSignalSubtext: t('strongSignalSubtext'),
          mediumSignalLabel: t('mediumSignalLabel'),
          mediumSignalSubtext: t('mediumSignalSubtext'),
          weakSignalLabel: t('weakSignalLabel'),
          weakSignalSubtext: t('weakSignalSubtext'),
          footerMessage: t('footerMessage'),
          footerSubtext: t('footerSubtext'),
          footerText: t('footerText'),
          websiteText: t('websiteText'),
          unsubscribeText: t('unsubscribeText'),
        };

        // Send email using Mailgun template
        await mg.messages.create(mailgunDomain, {
          from: `Idir from idir.ai <newsletter@idir.ai>`,
          to: [subscriber.email],
          subject: t('subject'),
          template: TEMPLATE_NAME,
          'h:X-Mailgun-Variables': JSON.stringify(templateVariables),
        });

        // Record that feedback email was sent (unless it's a test email)
        if (!testEmail) {
          try {
            const now = new Date().toISOString();

            // Check if record exists for this subscriber and campaign
            const { data: existing } = await supabase
              .from('newsletter_feedback')
              .select('id')
              .eq('subscriber_email', subscriber.email)
              .eq('campaign_date', campaignDate)
              .single();

            if (existing) {
              // Update existing record with new sent_at
              await supabase
                .from('newsletter_feedback')
                .update({ sent_at: now })
                .eq('subscriber_email', subscriber.email)
                .eq('campaign_date', campaignDate);
            } else {
              // Create new record
              await supabase
                .from('newsletter_feedback')
                .insert({
                  subscriber_email: subscriber.email,
                  campaign_date: campaignDate,
                  sent_at: now,
                });
            }
          } catch (dbError) {
            console.error(`Error recording sent_at for ${subscriber.email}:`, dbError);
            // Don't fail the whole operation if DB logging fails
          }
        }

        results.sent++;
        console.log(`✓ Sent feedback survey to ${subscriber.email} (${lang}) using template: ${TEMPLATE_NAME}`);
      } catch (error: any) {
        console.error(`Error sending to ${subscriber.email}:`, error);
        results.failed++;
        results.errors.push(`${subscriber.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error sending feedback surveys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
