import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();

  return NextResponse.json({
    allCookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    hasSessionToken: !!request.cookies.get('next-auth.session-token'),
    hasSecureSessionToken: !!request.cookies.get('__Secure-next-auth.session-token'),
  });
}
