import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  endpoint: z.string().url(),
  payload: z.record(z.string(), z.any()),
});

function isAllowedEndpoint(endpoint: URL): boolean {
  if (endpoint.protocol !== 'https:') return false;
  const allowlist = (process.env.COURSE_SIGNUP_ENDPOINT_ALLOWLIST || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowlist.length === 0) {
    // No allowlist configured; allow all HTTPS endpoints.
    return true;
  }
  return allowlist.includes(endpoint.host);
}

/**
 * Proxy course signup submissions to external endpoint to avoid browser CORS.
 * POST /api/course-signup
 * Body: { endpoint: string, payload: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = BodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const endpoint = new URL(validation.data.endpoint);
    if (!isAllowedEndpoint(endpoint)) {
      return NextResponse.json(
        { error: 'Endpoint not allowed' },
        { status: 403 }
      );
    }

    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data.payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'content-type': contentType || 'text/plain' },
    });
  } catch (error) {
    console.error('Error in POST /api/course-signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
