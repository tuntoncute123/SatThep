import 'server-only';
import { z } from 'zod';
import { getDb } from './db';
import { quoteSchema } from './schemas';
import { HttpError } from './errors';
export async function listQuotes() {
  const db = await getDb();
  return db.prepare('SELECT * FROM quotes ORDER BY createdAt DESC').all();
}
export async function createQuote(body) {
  const quote = quoteSchema.parse(body);
  const db = await getDb();
  const result = await db
    .prepare(
      `
    INSERT INTO quotes (name,phone,email,company,product,quantity,message,createdAt)
    VALUES (?,?,?,?,?,?,?,?)
  `,
    )
    .run(
      quote.name,
      quote.phone,
      quote.email,
      quote.company,
      quote.product,
      quote.quantity,
      quote.message,
      new Date().toISOString(),
    );
  return {
    id: Number(result.lastInsertRowid),
    message: 'Đã nhận yêu cầu báo giá.',
  };
}
export async function updateQuote(id, body) {
  const { status } = z
    .object({
      status: z.enum(['new', 'contacted', 'completed']),
    })
    .parse(body);
  const db = await getDb();
  const result = await db.prepare('UPDATE quotes SET status=? WHERE id=?').run(status, id);
  if (!result.changes) {
    throw new HttpError(404, 'Không tìm thấy yêu cầu.');
  }
  return {
    ok: true,
  };
}
