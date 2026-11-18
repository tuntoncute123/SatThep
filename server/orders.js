import 'server-only';
import { z } from 'zod';
import { getDb } from './db';
import { HttpError } from './errors';
const orderSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().finite().positive().max(1e7),
      }),
    )
    .min(1)
    .max(50),
  note: z.string().max(2000).default(''),
});
export function listOrders() {
  return getDb()
    .prepare(
      `
    SELECT o.*,c.name AS customerName,c.company FROM orders o
    JOIN customers c ON c.id=o.customerId ORDER BY o.createdAt DESC
  `,
    )
    .all()
    .map((order) => {
      return {
        ...order,
        items: JSON.parse(order.items),
      };
    });
}
export function createOrder(body) {
  const data = orderSchema.parse(body);
  const db = getDb();
  if (!db.prepare('SELECT id FROM customers WHERE id=?').get(data.customerId)) {
    throw new HttpError(400, 'Khách hàng không tồn tại.');
  }
  const items = data.items.map((item) => {
    const product = db.prepare('SELECT * FROM products WHERE id=?').get(item.productId);
    if (!product) {
      throw new HttpError(400, 'Sản phẩm không tồn tại.');
    }
    return {
      ...item,
      name: product.name,
      price: product.price,
      unit: product.unit,
    };
  });
  const total = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  const result = db
    .prepare(
      `
    INSERT INTO orders (customerId,items,total,status,note,createdAt)
    VALUES (?,?,?,'new',?,?)
  `,
    )
    .run(data.customerId, JSON.stringify(items), total, data.note, new Date().toISOString());
  return {
    id: Number(result.lastInsertRowid),
    total,
  };
}
export function updateOrder(id, body) {
  const { status } = z
    .object({
      status: z.enum(['new', 'confirmed', 'delivering', 'completed', 'cancelled']),
    })
    .parse(body);
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    // Read inside the write transaction so concurrent completions cannot deduct stock twice.
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(id);
    if (!order) {
      throw new HttpError(404, 'Không tìm thấy đơn hàng.');
    }
    const direction = (status === 'completed' ? 1 : 0) - (order.status === 'completed' ? 1 : 0);
    for (const item of JSON.parse(order.items)) {
      if (!direction) {
        continue;
      }
      const product = db.prepare('SELECT * FROM products WHERE id=?').get(item.productId);
      if (!product || product.stock < item.quantity * direction) {
        throw new HttpError(400, `Không đủ tồn kho cho ${item.name}.`);
      }
      db.prepare('UPDATE products SET stock=stock-? WHERE id=?').run(
        item.quantity * direction,
        item.productId,
      );
    }
    db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, id);
    db.exec('COMMIT');
    return {
      ok: true,
    };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
