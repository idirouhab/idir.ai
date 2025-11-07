import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';

// Get the secret key from environment variable
const getSecretKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

export type UserRole = 'owner' | 'admin' | 'blogger';

export type JWTPayload = {
  userId: string;
  role: UserRole;
  email: string;
  jti?: string;  // JWT ID - unique identifier for this token
  iat?: number;  // Issued At timestamp
  exp?: number;  // Expiration timestamp
};

/**
 * Generate a unique JWT ID (JTI)
 * Used to identify and revoke specific tokens
 */
function generateJTI(): string {
  return randomBytes(16).toString('hex');
}

// Sign a JWT token
export async function signToken(payload: JWTPayload): Promise<string> {
  const jti = generateJTI();

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(jti)  // Set unique token ID
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(getSecretKey());

  return token;
}

// Verify and decode a JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as JWTPayload;
  } catch (error) {
    // Token is invalid or expired
    console.error('JWT verification failed:', error);
    return null;
  }
}
