import { NextRequest, NextResponse } from 'next/server';
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
 * This API proxies requests to n8n webhook with JWT authentication
 * The JWT token is kept secure on the server side, never exposed to clients
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

    // Get n8n webhook configuration from environment (server-side only)
    const n8nWebhookUrl = process.env.N8N_SUBSCRIBE_WEBHOOK_URL;
    const n8nJwtToken = process.env.N8N_WEBHOOK_JWT_TOKEN;

    if (!n8nWebhookUrl || !n8nJwtToken) {
      console.error('Missing n8n webhook configuration');
      return NextResponse.json(
        { success: false, error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Proxy request to n8n webhook with JWT authentication
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${n8nJwtToken}`,
        },
        body: JSON.stringify(validation.data),
      });

      // Get response data
      const data = await response.json();

      // Forward the response from n8n to the client
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
