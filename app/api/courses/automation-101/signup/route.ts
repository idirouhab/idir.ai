import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Validation schema
const SignupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address').max(255),
  language: z.enum(['en', 'es']).default('es'),
  termsAccepted: z.boolean().refine(val => val === true, 'Must accept terms and conditions'),
});

/**
 * Public API endpoint for Automation 101 course signup
 * POST /api/courses/automation-101/signup
 *
 * Universal free access - no age restrictions.
 * Optional "pay what you can" model for support.
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

    const { fullName, email, language, termsAccepted } = validation.data;

    // Insert into database
    const { data, error } = await supabase
      .from('course_signups')
      .insert({
        full_name: fullName,
        email: email.toLowerCase(), // Normalize email
        course_slug: 'automation-101',
        language: language,
        signup_status: 'pending',
      })
      .select()
      .single();

    // Handle errors
    if (error) {
      console.error('Supabase error:', error);

      // Check for duplicate email (unique constraint violation)
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'This email is already registered for this course',
          },
          { status: 409 }
        );
      }

      // Generic database error
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred',
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful',
        data: {
          email: email.toLowerCase(),
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in course signup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
