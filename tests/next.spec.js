import { test, expect } from '@playwright/test';

test('Next.js renders public content on the server and keeps HTTP errors consistent', async ({
  request,
}) => {
  const page = await request.get('/san-pham');
  expect(page.status()).toBe(200);
  expect(await page.text()).toContain('Thép thanh vằn');

  const products = await request.get('/api/public/products');
  expect(products.headers()['cache-control']).toBe('no-store');
  expect(products.headers()['x-content-type-options']).toBe('nosniff');
  expect((await products.json())[0]).not.toHaveProperty('stock');

  const unknown = await request.get('/api/does-not-exist');
  expect(unknown.status()).toBe(404);
  expect(await unknown.json()).toEqual({ message: 'Không tìm thấy API.' });

  const malformed = await request.post('/api/public/quotes', {
    headers: { 'Content-Type': 'application/json' },
    data: Buffer.from('{broken'),
  });
  expect(malformed.status()).toBe(400);
  expect((await malformed.json()).message).toContain('không hợp lệ');

  const oversized = await request.post('/api/public/quotes', {
    data: { message: 'a'.repeat(65537) },
  });
  expect(oversized.status()).toBe(413);
  expect((await request.put('/api/public/products', { data: {} })).status()).toBe(405);
});

test('Protected deep links resume after login, and logout invalidates the session', async ({
  page,
}) => {
  await page.goto('/admin/bao-gia');
  await expect(page).toHaveURL(/\/admin\/dang-nhap\?next=/);
  await page.getByLabel('Email', { exact: true }).fill('admin@thepviet.vn');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('ThepViet@2026');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/bao-gia$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const session = (await page.context().cookies()).find((cookie) => {
    return cookie.name === 'tv_session';
  });
  expect(session.httpOnly).toBe(true);
  expect(session.sameSite).toBe('Strict');

  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page).toHaveURL(/\/admin\/dang-nhap$/);
  expect((await page.request.get('/api/auth/me')).status()).toBe(401);
});

test('Next.js query navigation preserves product filters across reload and browser history', async ({
  page,
}) => {
  await page.goto('/san-pham?danh-muc=' + encodeURIComponent('Thép hình'));
  await expect(page.locator('.catalog-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Thép tấm', exact: true }).click();
  await expect(page).toHaveURL(/danh-muc=/);
  await expect(page.locator('.catalog-card').first()).toContainText('Thép tấm');
  await page.reload();
  await expect(page.locator('.catalog-card').first()).toContainText('Thép tấm');
  await page.goBack();
  await expect(page.locator('.catalog-card').first()).toContainText('Thép hình');
});

test('Quote rate limiting returns JSON and Retry-After', async ({ request }) => {
  let limited;

  for (let attempt = 0; attempt < 21; attempt++) {
    const response = await request.post('/api/public/quotes', { data: {} });

    if (response.status() === 429) {
      limited = response;
      break;
    }

    expect(response.status()).toBe(400);
  }

  expect(limited).toBeDefined();
  expect(Number(limited.headers()['retry-after'])).toBeGreaterThan(0);
  expect((await limited.json()).message).toContain('thử gửi lại');
});
