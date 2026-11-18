import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const credentials = {
  email: 'admin@thepviet.vn',
  password: 'ThepViet@2026',
};

async function openQuotes(page) {
  const login = await page.request.post('/api/auth/login', { data: credentials });
  expect(login.ok()).toBe(true);
  await page.goto('/admin/bao-gia');
  await expect(page.getByRole('heading', { name: 'Yêu cầu báo giá', exact: true })).toBeVisible();
}

test('Quote search, filters, CSV and status updates preserve customer details', async ({
  page,
}) => {
  const customer = {
    name: 'Khách kiểm tra quản trị',
    phone: '0901234567',
    email: 'quote-review@example.com',
    company: 'Công ty "Thép, Việt"',
    product: 'Thép hình H',
    quantity: '12 tấn',
    message: 'Giao theo hai đợt.\nLiên hệ trước khi giao.',
  };
  const response = await page.request.post('/api/public/quotes', { data: customer });
  expect(response.status()).toBe(201);
  const { id } = await response.json();
  const code = `BG-${String(id).padStart(4, '0')}`;

  await openQuotes(page);
  const search = page.getByRole('textbox', { name: 'Tìm tên, số điện thoại, sản phẩm…' });
  await search.fill(`  ${customer.email.toUpperCase()}  `);
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText(code);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('yeu-cau-bao-gia.csv');
  const csv = readFileSync(await download.path(), 'utf8');
  expect(csv.startsWith('\uFEFF')).toBe(true);
  expect(csv).toContain(customer.email);
  expect(csv).toContain('"Công ty ""Thép, Việt"""');
  expect(csv).toContain(customer.message);
  expect(csv).not.toContain('Khách kiểm thử báo giá');

  await search.fill(code);
  await page.getByRole('button', { name: `Xem yêu cầu ${id}`, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(customer.message);
  await expect(dialog.getByRole('link', { name: customer.email })).toHaveAttribute(
    'href',
    `mailto:${customer.email}`,
  );

  await page.route(`**/api/admin/quotes/${id}`, async (route) => {
    await route.fulfill({ status: 503, json: { message: 'Chưa lưu được. Vui lòng thử lại.' } });
  });
  await dialog.getByLabel('Trạng thái xử lý').selectOption('contacted');
  await dialog.getByRole('button', { name: 'Lưu cập nhật' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Chưa lưu được');
  await expect(dialog.getByLabel('Trạng thái xử lý')).toHaveValue('contacted');
  await page.unroute(`**/api/admin/quotes/${id}`);

  let releaseUpdate;
  const updateGate = new Promise((resolve) => {
    releaseUpdate = resolve;
  });
  await page.route(`**/api/admin/quotes/${id}`, async (route) => {
    await updateGate;
    await route.continue();
  });
  try {
    await dialog.getByRole('button', { name: 'Lưu cập nhật' }).click();
    await expect(dialog.getByRole('button', { name: 'Đang lưu…' })).toBeDisabled();
    await expect(dialog.getByLabel('Trạng thái xử lý')).toBeDisabled();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
  } finally {
    releaseUpdate();
  }
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('tbody tr')).toContainText('Đã liên hệ');
  await page.reload();
  await search.fill(code);
  await expect(page.locator('tbody tr')).toContainText('Đã liên hệ');

  await page
    .locator('.quote-summary')
    .getByRole('button', { name: /Chưa liên hệ/ })
    .click();
  await expect(page.getByText('Chưa có yêu cầu phù hợp')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xuất CSV' })).toBeDisabled();
  await page
    .locator('.quote-summary')
    .getByRole('button', { name: /Tổng yêu cầu/ })
    .click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByLabel('Lọc trạng thái báo giá')).toHaveValue('all');
});

test('Quotes can recover from a failed list request without exporting stale data', async ({
  page,
}) => {
  await page.route('**/api/admin/quotes', async (route) => {
    await route.fulfill({ status: 503, json: { message: 'Không tải được yêu cầu báo giá.' } });
  });
  await openQuotes(page);
  await expect(page.locator('.admin-quotes').getByRole('alert')).toContainText(
    'Không tải được yêu cầu báo giá.',
  );
  await expect(page.getByRole('button', { name: 'Xuất CSV' })).toBeDisabled();
  await page.unroute('**/api/admin/quotes');
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xuất CSV' })).toBeEnabled();
});

test('Public phone validation rejects letters and preserves the form after a failed submission', async ({
  page,
}) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('regular expression')) {
      errors.push(message.text());
    }
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Nhận báo giá', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Họ và tên *').fill('Khách thử biểu mẫu');
  const phone = dialog.getByLabel('Số điện thoại *');
  await phone.fill('abcdefgh');
  expect(
    await phone.evaluate((element) => {
      return element.validity.patternMismatch;
    }),
  ).toBe(true);
  await phone.fill('+84 (901) 234-567');
  expect(
    await phone.evaluate((element) => {
      return element.checkValidity();
    }),
  ).toBe(true);

  await page.route('**/api/public/quotes', async (route) => {
    await route.fulfill({ status: 503, json: { message: 'Máy chủ đang bận. Vui lòng thử lại.' } });
  });
  await dialog.getByRole('button', { name: 'Gửi yêu cầu báo giá' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Máy chủ đang bận');
  await expect(phone).toHaveValue('+84 (901) 234-567');
  await page.unroute('**/api/public/quotes');
  await dialog.getByRole('button', { name: 'Gửi yêu cầu báo giá' }).click();
  await expect(dialog.getByRole('heading', { name: 'Yêu cầu đã được gửi!' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Quote detail reflows long customer data and typography grows on large screens', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.route('**/api/admin/quotes', async (route) => {
    await route.fulfill({
      json: [
        {
          id: 99999,
          name: 'Khách hàng ' + 'A'.repeat(130),
          phone: '0901234567',
          email: 'sales.' + 'a'.repeat(50) + '@example.com',
          company: 'Công ty ' + 'B'.repeat(140),
          product: 'C'.repeat(200),
          quantity: 'D'.repeat(100),
          message: 'Dòng đầu tiên.\n' + 'E'.repeat(300),
          createdAt: '2026-11-16T10:00:00.000Z',
          status: 'new',
        },
      ],
    });
  });
  await openQuotes(page);
  const measurements = [];

  for (const width of [360, 390, 768, 1366, 1920, 2560]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.evaluate(() => {
      document.querySelector('.table-scroll').scrollLeft = 0;
      return document.fonts.ready;
    });
    measurements.push(
      await page.evaluate(() => {
        const size = (selector) => {
          return parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
        };
        return {
          width: innerWidth,
          heading: size('.admin-page-heading h1'),
          body: size('.admin-page-heading p'),
          button: size('.admin-heading-actions .button'),
          card: size('.quote-summary span'),
        };
      }),
    );
    await page.screenshot({ path: testInfo.outputPath(`quotes-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Xem yêu cầu 99999' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(
      await dialog.evaluate((element) => {
        return element.scrollWidth > element.clientWidth;
      }),
      `Dialog overflow at ${width}px`,
    ).toBe(false);
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth > innerWidth;
      }),
      `Page overflow at ${width}px`,
    ).toBe(false);
    await dialog.getByLabel('Trạng thái xử lý').selectOption('completed');
    await page.screenshot({ path: testInfo.outputPath(`quote-detail-${width}.png`) });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  for (let index = 4; index < measurements.length; index++) {
    for (const role of ['heading', 'body', 'button', 'card']) {
      expect(measurements[index][role]).toBeGreaterThan(measurements[index - 1][role]);
    }
  }
  writeFileSync(
    testInfo.outputPath('quote-typography.json'),
    JSON.stringify(measurements, null, 2),
  );
});
