import { SignJWT, jwtVerify } from 'jose';

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
};

// Sign a JWT token
export async function signToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
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
