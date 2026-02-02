import { NextRequest, NextResponse } from 'next/server';

/**
 * Strips sensitive answer fields from test data
 * Removes: correctAnswer, acceptedVariations, sampleSolution
 */
function stripCorrectAnswers(data: any): any {
  if (!data.questions) return data;

  return {
    ...data,
    questions: data.questions.map((q: any) => {
      const { correctAnswer, acceptedVariations, sampleSolution, ...rest } = q;

      // For code questions, strip sampleSolution from languages
      if (q.type === 'code' && q.languages) {
        return {
          ...rest,
          languages: q.languages.map((lang: any) => {
            const { sampleSolution, ...langRest } = lang;
            return langRest;
          })
        };
      }

      return rest;
    })
  };
}

/**
 * GET endpoint - Fetches questions or results
 * Query params:
 * - action=questions: Get test questions (with answers stripped)
 * - action=result: Get scoring information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    const webhookUrl = process.env.TEST_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('TEST_WEBHOOK_URL environment variable is not configured');
      return NextResponse.json(
        { error: 'Test service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Build webhook URL with query parameters
    const url = new URL(webhookUrl);

    if (action === 'questions') {
      url.searchParams.set('questions', 'true');
    } else if (action === 'result') {
      url.searchParams.set('result', 'true');
    }

    // Fetch from external webhook
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    const data = await response.json();

    // Strip sensitive answer data when fetching questions
    if (action === 'questions') {
      const sanitizedData = stripCorrectAnswers(data);
      return NextResponse.json(sanitizedData);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in automation-test GET API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test data. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint - Submits answers for evaluation
 * Body: { answers: Record<string, any> } or single answer submission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.TEST_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('TEST_WEBHOOK_URL environment variable is not configured');
      return NextResponse.json(
        { error: 'Test service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Build webhook URL for result submission
    const url = new URL(webhookUrl);
    url.searchParams.set('result', 'true');

    // Forward submission to webhook
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in automation-test POST API:', error);
    return NextResponse.json(
      { error: 'Failed to submit answers. Please try again.' },
      { status: 500 }
    );
  }
}
