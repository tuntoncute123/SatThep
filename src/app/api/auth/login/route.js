import { route } from '@server/http';
import { NextResponse } from 'next/server';
import { login, adminUser, sessionCookie, cookieOptions } from '@server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(
  async ({ body }) => {
    const token = await login(body);
    const response = NextResponse.json(adminUser());
    response.cookies.set(sessionCookie, token, cookieOptions());
    return response;
  },
  {
    body: true,
    rateLimit: {
      scope: 'login',
      windowMs: 15 * 60 * 1000,
      limit: 20,
      message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.',
    },
  },
);
