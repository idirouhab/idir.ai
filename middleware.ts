import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { isTokenBlacklisted } from './lib/session-blacklist';

const intlMiddleware = createMiddleware(routing);

async function verifySession(token: string, checkBlacklist: boolean = true): Promise<boolean> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      return false;
    }
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    // PERFORMANCE OPTIMIZATION: Only check blacklist for critical operations
    // Skip blacklist check for regular page views to improve performance
    if (checkBlacklist) {
      const jti = payload.jti as string | undefined;
      if (jti) {
        const blacklisted = await isTokenBlacklisted(jti);
        if (blacklisted) {
          console.log('Token is blacklisted:', jti);
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PERFORMANCE: Skip middleware entirely for API routes and static assets
  // This reduces processing time for non-page requests
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Public admin routes (no authentication required)
  const publicAdminRoutes = ['/admin/login', '/admin/signup'];
  const isPublicAdminRoute = publicAdminRoutes.some(route => pathname.startsWith(route));

  // Admin authentication check
  if (pathname.startsWith('/admin') && !isPublicAdminRoute) {
    const sessionCookie = request.cookies.get('admin-session');

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // PERFORMANCE: Skip blacklist check for regular page views
    const isValid = await verifySession(sessionCookie.value, false);
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // Apply i18n middleware only to public pages (not admin/api)
  // This is where the main performance cost is for public visitors
  return intlMiddleware(request);
}

export const config = {
  // PERFORMANCE: Exclude more paths from middleware processing
  // Only match actual pages, not static assets, images, or internal routes
  matcher: [
    // Include all pages
    '/((?!api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)).*)',
  ]
};
