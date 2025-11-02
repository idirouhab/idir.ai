import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's an admin route (but not login or API)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/api')) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('admin-session');

    if (!sessionCookie) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // For all other routes, use the intl middleware
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
