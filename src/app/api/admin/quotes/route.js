import { route } from '@server/http';
import { listQuotes } from '@server/quotes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(
  () => {
    return listQuotes();
  },
  { auth: true },
);
