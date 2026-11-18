import { route } from '@server/http';
import { NextResponse } from 'next/server';
import { createQuote } from '@server/quotes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(
  async ({ body }) => {
    return NextResponse.json(await createQuote(body), { status: 201 });
  },
  {
    body: true,
    rateLimit: {
      scope: 'quotes',
      windowMs: 3600000,
      limit: 20,
      message: 'Vui lòng thử gửi lại yêu cầu sau.',
    },
  },
);
