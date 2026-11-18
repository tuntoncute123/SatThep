import { route } from '@server/http';
import { NextResponse } from 'next/server';
import { logout, sessionCookie, cookieOptions } from '@server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async ({ request }) => {
  await logout(request);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie, '', { ...cookieOptions(), maxAge: 0 });
  return response;
});
