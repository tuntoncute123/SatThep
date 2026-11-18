import 'server-only';
import { getDb } from './db';
import { listOrders } from './orders';
export async function getOverview() {
  const db = await getDb();
  const [orders, customers, products, quotes, lowStock] = await Promise.all([
    listOrders(),
    db.prepare('SELECT count(*) AS n FROM customers').get(),
    db.prepare('SELECT count(*) AS n FROM products').get(),
    db.prepare("SELECT count(*) AS n FROM quotes WHERE status='new'").get(),
    db.prepare('SELECT * FROM products WHERE stock<20000 ORDER BY stock').all(),
  ]);
  const date = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    const revenue = orders.reduce((sum, order) => {
      return (
        sum + (order.status === 'completed' && order.createdAt.startsWith(key) ? order.total : 0)
      );
    }, 0);
    months.push({
      label: `T${month.getMonth() + 1}`,
      revenue,
    });
  }
  return {
    revenue: orders.reduce((sum, order) => {
      return sum + (order.status === 'completed' ? order.total : 0);
    }, 0),
    orderCount: orders.length,
    customerCount: customers.n,
    productCount: products.n,
    quoteCount: quotes.n,
    months,
    recentOrders: orders.slice(0, 5),
    lowStock,
  };
}
