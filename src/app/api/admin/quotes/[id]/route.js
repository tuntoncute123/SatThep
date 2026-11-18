import { route, recordId } from '@server/http';
import { updateQuote } from '@server/quotes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = route(
  ({ params, body }) => {
    return updateQuote(recordId(params.id), body);
  },
  { auth: true, body: true },
);
