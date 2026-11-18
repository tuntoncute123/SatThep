import { test, expect } from '@playwright/test';

test('Concurrent order completions deduct stock once and rejected updates preserve data', async ({
  request,
}) => {
  const login = await request.post('/api/auth/login', {
    data: { email: 'admin@thepviet.vn', password: 'ThepViet@2026' },
  });
  expect(login.status()).toBe(200);

  const products = await (await request.get('/api/admin/products')).json();
  const customers = await (await request.get('/api/admin/customers')).json();
  const product = products.find((item) => {
    return item.stock > 30;
  });
  const response = await request.post('/api/admin/orders', {
    data: {
      customerId: customers[0].id,
      items: [
        { productId: product.id, quantity: 10 },
        { productId: product.id, quantity: 20 },
      ],
    },
  });
  expect(response.status()).toBe(201);
  const order = await response.json();
  expect(order.id).toEqual(expect.any(Number));
  expect(order.total).toBe(product.price * 30);

  const completions = await Promise.all([
    request.patch(`/api/admin/orders/${order.id}`, { data: { status: 'completed' } }),
    request.patch(`/api/admin/orders/${order.id}`, { data: { status: 'completed' } }),
  ]);
  for (const completion of completions) {
    expect(completion.status()).toBe(200);
  }
  const afterCompletion = await (await request.get('/api/admin/products')).json();
  expect(
    afterCompletion.find((item) => {
      return item.id === product.id;
    }).stock,
  ).toBe(product.stock - 30);

  const cancelled = await request.patch(`/api/admin/orders/${order.id}`, {
    data: { status: 'cancelled' },
  });
  expect(cancelled.status()).toBe(200);
  const afterCancel = await (await request.get('/api/admin/products')).json();
  expect(
    afterCancel.find((item) => {
      return item.id === product.id;
    }).stock,
  ).toBe(product.stock);

  const invalid = await request.post('/api/admin/orders', {
    data: { customerId: 2147483647, items: [{ productId: product.id, quantity: 1 }] },
  });
  expect(invalid.status()).toBe(400);
  const missing = await request.patch('/api/admin/orders/2147483647', {
    data: { status: 'completed' },
  });
  expect(missing.status()).toBe(404);
  expect((await request.get('/api/admin/overview')).status()).toBe(200);

  expect((await request.post('/api/auth/logout')).status()).toBe(200);
  expect((await request.get('/api/admin/orders')).status()).toBe(401);
});
