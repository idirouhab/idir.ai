'use client';

import { getSiteDomain } from '@/lib/site-config';

/**
 * Client component that displays the site domain name
 * Uses the NEXT_PUBLIC_SITE_URL environment variable
 */
export default function SiteName() {
  // On client side, get from window.location
  if (typeof window !== 'undefined') {
    return <>{window.location.host}</>;
  }

  // On server side (fallback)
  return <>{getSiteDomain()}</>;
}
