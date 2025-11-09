import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { z } from 'zod';

// Validation schema
const ShareSchema = z.object({
  platform: z.enum(['linkedin', 'twitter']),
  title: z.string(),
  excerpt: z.string(),
  postUrl: z.string().url(),
  language: z.enum(['en', 'es']),
});

/**
 * API endpoint to get generated social media content from n8n
 * POST /api/blog/share
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionCookie = cookies().get('admin-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = ShareSchema.safeParse(body);

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

    const { platform, title, excerpt, postUrl, language } = validation.data;

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = process.env.N8N_SHARE_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error('N8N_SHARE_WEBHOOK_URL environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Social sharing is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for n8n
    const n8nPayload = {
      platform,
      title,
      excerpt,
      postUrl,
      language,
    };

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to generate social post content' },
        { status: 500 }
      );
    }

    // Get response as text first to see what we're getting
    const responseText = await n8nResponse.text();

    // Try to parse as JSON
    let n8nData;
    try {
      n8nData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse n8n response as JSON:', parseError);
      console.error('Response was:', responseText);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from n8n webhook',
          details: 'Response is not valid JSON'
        },
        { status: 500 }
      );
    }

    // Extract content from n8n response (handle different formats)
    let content = '';
    if (typeof n8nData === 'string') {
      content = n8nData;
    } else if (n8nData.content) {
      content = n8nData.content;
    } else if (n8nData.data && n8nData.data.content) {
      content = n8nData.data.content;
    } else {
      console.error('Unexpected n8n response format:', n8nData);
      return NextResponse.json(
        { success: false, error: 'Invalid response format from n8n' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: content,
    });
  } catch (error) {
    console.error('Error in POST /api/blog/share:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
