import { route, recordId } from '@server/http';
import { saveRecord, deleteRecord } from '@server/catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = route(
  ({ params, body }) => {
    return saveRecord('products', body, recordId(params.id));
  },
  { auth: true, body: true },
);

export const DELETE = route(
  ({ params }) => {
    return deleteRecord('products', recordId(params.id));
  },
  { auth: true },
);
