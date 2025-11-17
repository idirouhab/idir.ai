/**
 * Get the base URL for the site
 * Returns the configured site URL or falls back to localhost in development
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Fallback for local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Fallback for production (should not happen if env var is set)
  return 'https://idir.ai';
}

/**
 * Get the domain name without protocol
 */
export function getSiteDomain(): string {
  return getSiteUrl().replace(/^https?:\/\//, '');
}
