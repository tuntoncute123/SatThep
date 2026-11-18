import { route } from '@server/http';
import { adminUser } from '@server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(
  () => {
    return adminUser();
  },
  { auth: true },
);
