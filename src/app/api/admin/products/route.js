import { route } from '@server/http';
import { NextResponse } from 'next/server';
import { listRecords, saveRecord } from '@server/catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(
  () => {
    return listRecords('products');
  },
  { auth: true },
);

export const POST = route(
  ({ body }) => {
    return NextResponse.json(saveRecord('products', body), { status: 201 });
  },
  { auth: true, body: true },
);
