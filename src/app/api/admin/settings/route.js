import { route } from '@server/http';
import { updateSettings } from '@server/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = route(
  ({ body }) => {
    return updateSettings(body);
  },
  { auth: true, body: true },
);
