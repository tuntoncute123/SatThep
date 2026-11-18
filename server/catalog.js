import 'server-only';
import { getDb } from './db';
import { HttpError } from './errors';
import { productSchema, customerSchema } from './schemas';
const resources = {
  products: productSchema,
  customers: customerSchema,
};
function resourceSchema(table) {
  if (!Object.hasOwn(resources, table)) {
    throw new HttpError(404, 'Không tìm thấy API.');
  }
  return resources[table];
}
export async function getSettings() {
  const db = await getDb();
  const row = await db.prepare('SELECT data FROM settings WHERE id=1').get();
  return JSON.parse(row.data);
}
export async function getPublicProducts() {
  const db = await getDb();
  return db
    .prepare(
      `
    SELECT id,name,sku,category,brand,unit,spec,description
    FROM products WHERE active=1 ORDER BY id
  `,
    )
    .all();
}
export async function listRecords(table) {
  resourceSchema(table);
  const db = await getDb();
  return db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
}
export async function saveRecord(table, body, id) {
  const data = resourceSchema(table).parse(body);
  const keys = Object.keys(data);
  const db = await getDb();
  if (id !== undefined) {
    const assignments = keys
      .map((key) => {
        return `${key}=?`;
      })
      .join(',');
    const result = await db
      .prepare(`UPDATE ${table} SET ${assignments} WHERE id=?`)
      .run(...Object.values(data), id);
    if (!result.changes) {
      throw new HttpError(404, 'Không tìm thấy bản ghi.');
    }
    return {
      ...data,
      id,
    };
  }
  const placeholders = keys
    .map(() => {
      return '?';
    })
    .join(',');
  const result = await db
    .prepare(
      `
    INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})
  `,
    )
    .run(...Object.values(data));
  return {
    ...data,
    id: Number(result.lastInsertRowid),
  };
}
export async function deleteRecord(table, id) {
  resourceSchema(table);
  const database = await getDb();
  return database.transaction(async (db) => {
    const orders = table === 'products' ? await db.prepare('SELECT items FROM orders').all() : [];
    const inOrder =
      table === 'products' &&
      orders.some((order) => {
        return JSON.parse(order.items).some((item) => {
          return item.productId === id;
        });
      });
    if (inOrder) {
      throw new HttpError(
        409,
        'Sản phẩm có trong đơn hàng. Hãy chuyển sang trạng thái ẩn để giữ lịch sử.',
      );
    }
    const result = await db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id);
    if (!result.changes) {
      throw new HttpError(404, 'Không tìm thấy bản ghi.');
    }
    return {
      ok: true,
    };
  });
}
