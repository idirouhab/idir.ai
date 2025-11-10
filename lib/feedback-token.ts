import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret-key'
);

export type FeedbackPayload = {
  email: string;
  campaignDate: string; // YYYY-MM-DD format
};

/**
 * Generate a feedback token for email tracking
 */
export async function generateFeedbackToken(payload: FeedbackPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d') // Token valid for 30 days
    .sign(secret);

  return token;
}

/**
 * Verify and decode a feedback token
 */
export async function verifyFeedbackToken(token: string): Promise<FeedbackPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as FeedbackPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
