// Simple in-memory rate limiter
// For production with multiple servers, use Upstash Redis

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export type RateLimitConfig = {
  requests: number; // Number of requests allowed
  window: number; // Time window in seconds
};

export const rateLimitConfigs = {
  auth: { requests: 5, window: 60 }, // 5 login attempts per minute
  blog: { requests: 10, window: 60 }, // 10 blog creations per minute
  newsletter: { requests: 3, window: 3600 }, // 3 newsletter signups per hour
  ai: { requests: 5, window: 300 }, // 5 AI requests per 5 minutes
};

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const windowMs = config.window * 1000;
  const key = `${identifier}`;

  const entry = rateLimitMap.get(key);

  // If no entry or reset time has passed, create new entry
  if (!entry || entry.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return {
      success: true,
      remaining: config.requests - 1,
      reset: Math.floor(resetTime / 1000),
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.requests) {
    return {
      success: false,
      remaining: 0,
      reset: Math.floor(entry.resetTime / 1000),
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.requests - entry.count,
    reset: Math.floor(entry.resetTime / 1000),
  };
}

export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (works with Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip;
}
