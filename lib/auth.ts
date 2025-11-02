import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';

export async function checkAuth(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get('admin-session');
  if (!sessionCookie) {
    return false;
  }

  const payload = await verifyToken(sessionCookie.value);
  return !!payload;
}

export async function checkAuthFromCookies(): Promise<boolean> {
  const sessionCookie = cookies().get('admin-session');
  if (!sessionCookie) {
    return false;
  }

  const payload = await verifyToken(sessionCookie.value);
  return !!payload;
}
