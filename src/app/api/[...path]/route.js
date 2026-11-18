import { route } from '@server/http';
import { HttpError } from '@server/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = route(() => {
  throw new HttpError(404, 'Không tìm thấy API.');
});

export {
  notFound as GET,
  notFound as POST,
  notFound as PUT,
  notFound as PATCH,
  notFound as DELETE,
};
