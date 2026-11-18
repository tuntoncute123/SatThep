import { route } from '@server/http';
import { getOverview } from '@server/overview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(
  () => {
    return getOverview();
  },
  { auth: true },
);
