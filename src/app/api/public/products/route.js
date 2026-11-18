import { route } from '@server/http';
import { getPublicProducts } from '@server/catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(() => {
  return getPublicProducts();
});
