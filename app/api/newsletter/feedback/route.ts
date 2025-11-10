import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyFeedbackToken } from '@/lib/feedback-token';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Handle feedback submission from newsletter
 * GET /api/newsletter/feedback?token=xxx&type=very_useful
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const feedbackType = searchParams.get('type');

    if (!token || !feedbackType) {
      return NextResponse.json(
        { error: 'Missing token or feedback type' },
        { status: 400 }
      );
    }

    // Validate feedback type
    if (!['very_useful', 'useful', 'not_useful'].includes(feedbackType)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    // Verify token
    const payload = await verifyFeedbackToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { email, campaignDate } = payload;

    // Get IP and user agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store feedback (upsert to handle duplicate submissions)
    const { error } = await supabase.from('newsletter_feedback').upsert(
      {
        subscriber_email: email,
        feedback_type: feedbackType,
        campaign_date: campaignDate,
        ip_address: ipAddress,
        user_agent: userAgent,
        responded_at: new Date().toISOString(),
      },
      {
        onConflict: 'subscriber_email,campaign_date',
      }
    );

    if (error) {
      console.error('Error storing feedback:', error);
      return NextResponse.json(
        { error: 'Failed to store feedback' },
        { status: 500 }
      );
    }

    // Return a simple thank you page
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You!</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            text-align: center;
            max-width: 500px;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 16px;
            color: #00ff88;
            text-transform: uppercase;
          }
          p {
            font-size: 18px;
            color: #888;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #333;
          }
          a {
            color: #00ff88;
            text-decoration: none;
            font-weight: bold;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✓</div>
          <h1>Thanks for your feedback!</h1>
          <p>Your response helps me improve the daily AI newsletter.</p>
          <div class="footer">
            <p><a href="https://idir.ai">← Back to idir.ai</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error in newsletter feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
