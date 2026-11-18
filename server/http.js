import 'server-only';
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { requireAuth } from './auth';
import { getDb } from './db';
import { HttpError } from './errors';
const maxBodyBytes = 64 * 1024;
function checkOrigin(request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return;
  }
  const origin = request.headers.get('origin');
  if (origin) {
    let valid = false;
    try {
      valid = new URL(origin).host === request.headers.get('host');
    } catch {
      valid = false;
    }
    if (!valid) {
      throw new HttpError(403, 'Nguồn yêu cầu không hợp lệ.');
    }
  }
}
async function readJson(request) {
  if (!request.body) {
    return {};
  }
  if (Number(request.headers.get('content-length')) > maxBodyBytes) {
    throw new HttpError(413, 'Dữ liệu gửi lên vượt quá 64 KB.');
  }
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        throw new HttpError(413, 'Dữ liệu gửi lên vượt quá 64 KB.');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Dữ liệu gửi lên không hợp lệ.');
  }
}
async function checkRateLimit(request, { scope, windowMs, limit, message }) {
  // Enable only behind a trusted proxy that overwrites X-Forwarded-For.
  const client =
    process.env.TRUST_PROXY === '1'
      ? request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'shared'
      : 'shared';
  const key = createHash('sha256').update(`${scope}:${client}`).digest('hex');
  const db = await getDb();
  const now = Date.now();
  await db.prepare('DELETE FROM rate_limits WHERE expires<=?').run(now);
  const record = await db
    .prepare(
      `
    INSERT INTO rate_limits (key, count, expires) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET count=count+1
    RETURNING count, expires
  `,
    )
    .get(key, now + windowMs);
  if (record.count > limit) {
    const error = new HttpError(429, message);
    error.retryAfter = Math.max(1, Math.ceil((record.expires - now) / 1000));
    throw error;
  }
}
export function route(handler, { auth = false, body = false, rateLimit } = {}) {
  return async function handleRequest(request, context) {
    let response;
    try {
      checkOrigin(request);
      if (auth) {
        await requireAuth(request);
      }
      if (rateLimit) {
        await checkRateLimit(request, rateLimit);
      }
      const params = (await context?.params) || {};
      const data = body ? await readJson(request) : undefined;
      const result = await handler({
        request,
        params,
        body: data,
      });
      response = result instanceof Response ? result : NextResponse.json(result);
    } catch (error) {
      let status = 500;
      let message = 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
      if (error instanceof z.ZodError) {
        status = 400;
        message =
          'Vui lòng kiểm tra thông tin: ' +
          error.issues
            .map((issue) => {
              return `${issue.path.join('.')} — ${issue.message}`;
            })
            .join('; ');
      } else if (error instanceof HttpError) {
        status = error.status;
        message = error.message;
      } else if (/UNIQUE constraint|FOREIGN KEY/.test(error.message)) {
        status = 409;
        message = 'Mã sản phẩm đã tồn tại hoặc dữ liệu đang được sử dụng trong đơn hàng.';
      } else {
        console.error(error);
      }
      response = NextResponse.json(
        {
          message,
        },
        {
          status,
        },
      );
      if (error.retryAfter) {
        response.headers.set('Retry-After', String(error.retryAfter));
      }
    }
    response.headers.set('Cache-Control', 'no-store');
    return response;
  };
}
export function recordId(value) {
  return z.coerce.number().int().positive().parse(value);
}
