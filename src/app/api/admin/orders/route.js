import { route } from '@server/http';
import { NextResponse } from 'next/server';
import { listOrders, createOrder } from '@server/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(
  () => {
    return listOrders();
  },
  { auth: true },
);

export const POST = route(
  async ({ body }) => {
    return NextResponse.json(await createOrder(body), { status: 201 });
  },
  { auth: true, body: true },
);
