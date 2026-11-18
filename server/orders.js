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
export async function listOrders() {
  const db = await getDb();
  const rows = await db
    .prepare(
      `
    SELECT o.*,c.name AS customerName,c.company FROM orders o
    JOIN customers c ON c.id=o.customerId ORDER BY o.createdAt DESC
  `,
    )
    .all();
  return rows.map((order) => {
    return {
      ...order,
      items: JSON.parse(order.items),
    };
  });
}
export async function createOrder(body) {
  const data = orderSchema.parse(body);
  const database = await getDb();
  return database.transaction(async (db) => {
    const customer = await db.prepare('SELECT id FROM customers WHERE id=?').get(data.customerId);
    if (!customer) {
      throw new HttpError(400, 'Khách hàng không tồn tại.');
    }
    const productIds = data.items.map((item) => {
      return item.productId;
    });
    const placeholders = productIds
      .map(() => {
        return '?';
      })
      .join(',');
    const products = await db
      .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
      .all(...productIds);
    const items = data.items.map((item) => {
      const product = products.find((record) => {
        return record.id === item.productId;
      });
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
    const result = await db
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
  });
}
export async function updateOrder(id, body) {
  const { status } = z
    .object({
      status: z.enum(['new', 'confirmed', 'delivering', 'completed', 'cancelled']),
    })
    .parse(body);
  const db = await getDb();
  return db.transaction(async (transaction) => {
    // Read and update within the same write transaction across all serverless instances.
    const order = await transaction.prepare('SELECT * FROM orders WHERE id=?').get(id);
    if (!order) {
      throw new HttpError(404, 'Không tìm thấy đơn hàng.');
    }
    const direction = (status === 'completed' ? 1 : 0) - (order.status === 'completed' ? 1 : 0);
    const statements = [];
    if (direction) {
      const quantities = new Map();
      for (const item of JSON.parse(order.items)) {
        const previous = quantities.get(item.productId)?.quantity || 0;
        quantities.set(item.productId, { ...item, quantity: previous + item.quantity });
      }
      const ids = [...quantities.keys()];
      const placeholders = ids
        .map(() => {
          return '?';
        })
        .join(',');
      const products = await transaction
        .prepare(`SELECT id,stock FROM products WHERE id IN (${placeholders})`)
        .all(...ids);
      for (const [productId, item] of quantities) {
        const product = products.find((record) => {
          return record.id === productId;
        });
        if (!product || product.stock < item.quantity * direction) {
          throw new HttpError(400, `Không đủ tồn kho cho ${item.name}.`);
        }
        statements.push({
          sql: 'UPDATE products SET stock=stock-? WHERE id=?',
          args: [item.quantity * direction, productId],
        });
      }
    }
    statements.push({ sql: 'UPDATE orders SET status=? WHERE id=?', args: [status, id] });
    await transaction.batch(statements);
    return { ok: true };
  });
}
