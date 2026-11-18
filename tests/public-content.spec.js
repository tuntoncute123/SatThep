import { test, expect } from '@playwright/test';

test('Extension attributes on body do not break hydration or cause duplicate API loads', async ({
  page,
}) => {
  const errors = [];
  const requests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  page.on('request', (request) => {
    if (request.url().includes('/api/')) {
      requests.push(new URL(request.url()).pathname);
    }
  });
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') {
      await route.continue();
      return;
    }

    const response = await route.fetch();
    const html = await response.text();
    expect(html).toContain('<body>');
    await route.fulfill({
      response,
      body: html.replace(
        '<body>',
        '<body data-testim-main-word-scripts-loaded="true" class="vsc-initialized">',
      ),
    });
  });

  await page.goto('/');
  await expect(page.locator('.public-site')).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('.hero h1')).toHaveCSS('opacity', '1');
  await expect(page.locator('body')).toHaveAttribute(
    'data-testim-main-word-scripts-loaded',
    'true',
  );
  await page.getByRole('button', { name: 'Nhận báo giá', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Họ và tên *').fill('Kiểm tra hydration');
  await expect(page.getByLabel('Họ và tên *')).toHaveValue('Kiểm tra hydration');
  await page.keyboard.press('Escape');

  expect(errors).toEqual([]);
  expect(requests).not.toContain('/api/public/products');
  expect(requests).not.toContain('/api/public/settings');
  expect(
    requests.filter((path) => {
      return path.startsWith('/api/ext/');
    }),
  ).toEqual([]);
});

test('Supply photo loads and FAQ supports keyboard interaction and quote action', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto('/');
  const photo = page.locator('.supply-photo img');
  await photo.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => {
      return photo.evaluate((element) => {
        return element.complete && element.naturalWidth > 0;
      });
    })
    .toBe(true);

  const question = page.locator('.buying-question').first();
  const summary = question.locator('summary');
  await summary.focus();
  await summary.press('Enter');
  await expect(question).toHaveAttribute('open', '');
  await expect(question.locator('p')).toBeVisible();
  await expect(page.locator('.buying-questions')).toHaveCSS('opacity', '1');
  await summary.press('Enter');
  await expect(question).not.toHaveAttribute('open', '');

  await page.getByRole('button', { name: 'Gửi nhu cầu của bạn' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/lien-he');
  await expect(page.locator('.buying-question')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('Supply guidance and questions remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });

  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5175');
    await expect(page.locator('.supply-copy')).toHaveCSS('opacity', '1');
    await page.locator('.buying-question summary').first().click();
    await expect(page.locator('.buying-question p').first()).toBeVisible();
  } finally {
    await context.close();
  }
});
