import { route } from '@server/http';
import { NextResponse } from 'next/server';
import { listRecords, saveRecord } from '@server/catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(
  () => {
    return listRecords('customers');
  },
  { auth: true },
);

export const POST = route(
  async ({ body }) => {
    return NextResponse.json(await saveRecord('customers', body), { status: 201 });
  },
  { auth: true, body: true },
);
