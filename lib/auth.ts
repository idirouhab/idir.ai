import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export function checkAuth(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('admin-session');
  return !!sessionCookie;
}

export function checkAuthFromCookies(): boolean {
  const sessionCookie = cookies().get('admin-session');
  return !!sessionCookie;
}
