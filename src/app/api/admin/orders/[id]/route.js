import { route, recordId } from '@server/http';
import { updateOrder } from '@server/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = route(
  ({ params, body }) => {
    return updateOrder(recordId(params.id), body);
  },
  { auth: true, body: true },
);
