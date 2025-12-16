import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const SignupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(255),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address').max(255),
  country: z.string().min(2, 'Country is required').max(10),
  birthYear: z.string().regex(/^\d{4}$/, 'Birth year must be 4 digits'),
  language: z.enum(['en', 'es']).default('es'),
  termsAccepted: z.boolean().refine(val => val === true, 'Must accept terms and conditions'),
});

/**
 * Public API endpoint for Automation 101 course signup
 * POST /api/courses/automation-101/signup
 *
 * Universal free access - no age restrictions.
 * Forwards signup data to n8n webhook for processing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = SignupSchema.safeParse(body);
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

    const { firstName, lastName, email, country, birthYear, language, termsAccepted } = validation.data;

    // Forward to n8n webhook
    const webhookUrl = 'https://idir-test.app.n8n.cloud/webhook/course-101-signup';

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email: email.toLowerCase(),
        country,
        birthYear,
        language,
        termsAccepted,
        courseSlug: 'automation-101',
        timestamp: new Date().toISOString(),
      }),
    });

    // Handle webhook response
    if (!webhookResponse.ok) {
      console.error('n8n webhook error:', webhookResponse.status, webhookResponse.statusText);

      // Check if it's a duplicate (if n8n returns specific status)
      if (webhookResponse.status === 409) {
        return NextResponse.json(
          {
            success: false,
            error: 'duplicate',
          },
          { status: 409 }
        );
      }

      // Generic webhook error
      return NextResponse.json(
        {
          success: false,
          error: 'signup_failed',
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in course signup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'signup_failed',
      },
      { status: 500 }
    );
  }
}
