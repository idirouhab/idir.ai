import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PERFORMANCE: Skip middleware entirely for API routes and static assets
  // This reduces processing time for non-page requests
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Handle admin routes BEFORE i18n middleware (admin routes should not have locale prefix)
  if (pathname.startsWith('/admin')) {
    // Public admin routes (no authentication required)
    const publicAdminRoutes = ['/admin/login', '/admin/signup'];
    const isPublicAdminRoute = publicAdminRoutes.some(route => pathname.startsWith(route));

    // Admin authentication check using cookies
    if (!isPublicAdminRoute) {
      // Check for admin-session cookie (custom JWT auth)
      const sessionToken = request.cookies.get('admin-session');

      if (!sessionToken) {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Return early for admin routes - don't apply i18n middleware
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
