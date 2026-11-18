import { test, expect, chromium } from '@playwright/test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('Real browser zoom at 200% keeps navigation and quote forms usable', async ({}, testInfo) => {
  const folder = mkdtempSync(join(tmpdir(), 'thepviet-zoom-'));
  const extension = join(folder, 'extension');
  mkdirSync(extension);
  writeFileSync(
    join(extension, 'manifest.json'),
    JSON.stringify({
      manifest_version: 3,
      name: 'Local browser zoom verification',
      version: '1.0',
      permissions: ['tabs'],
      background: { service_worker: 'background.js' },
    }),
  );
  writeFileSync(
    join(extension, 'background.js'),
    'chrome.runtime.onInstalled.addListener(() => {});',
  );

  const context = await chromium.launchPersistentContext(join(folder, 'profile'), {
    channel: 'chromium',
    headless: true,
    viewport: null,
    args: [
      '--window-size=1366,1000',
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
  });

  try {
    const worker = context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'));
    const page = context.pages()[0];
    await page.goto('http://127.0.0.1:5175');
    await page.locator('.public-site[data-motion-ready="true"]').waitFor();
    const zoom = await worker.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      const tab = tabs.find((item) => {
        return item.url?.startsWith('http://127.0.0.1:5175');
      });
      await chrome.tabs.setZoom(tab.id, 2);
      return chrome.tabs.getZoom(tab.id);
    });
    expect(zoom).toBe(2);
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          return innerWidth;
        });
      })
      .toBeLessThan(800);

    await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
    await page
      .getByRole('navigation', { name: 'Điều hướng chính' })
      .getByRole('link', { name: 'Sản phẩm', exact: true })
      .click();
    await expect(page).toHaveURL(/\/san-pham$/);
    await page
      .locator('.catalog-card')
      .first()
      .getByRole('button', { name: 'Nhận báo giá' })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Họ và tên *').fill('Kiểm tra cỡ chữ');
    await dialog.getByLabel('Số điện thoại *').fill('0901234567');
    await expect(dialog.getByRole('button', { name: 'Gửi yêu cầu báo giá' })).toBeVisible();
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth > innerWidth;
      }),
    ).toBe(false);
    await page.screenshot({ path: testInfo.outputPath('zoom-200.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    const login = await page.request.post('http://127.0.0.1:5175/api/auth/login', {
      data: { email: 'admin@thepviet.vn', password: 'ThepViet@2026' },
    });
    expect(login.ok()).toBe(true);
    await page.goto('http://127.0.0.1:5175/admin/bao-gia');
    await page
      .locator('tbody tr')
      .first()
      .getByRole('button', { name: /Xem yêu cầu/ })
      .click();
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Trạng thái xử lý').selectOption('contacted');
    await dialog.getByRole('button', { name: 'Đóng', exact: true }).scrollIntoViewIfNeeded();
    expect(
      await dialog.evaluate((element) => {
        return element.scrollWidth > element.clientWidth;
      }),
    ).toBe(false);
    await page.screenshot({ path: testInfo.outputPath('admin-zoom-200.png') });
    await dialog.getByRole('button', { name: 'Đóng', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth > innerWidth;
      }),
    ).toBe(false);
    writeFileSync(
      testInfo.outputPath('zoom.json'),
      JSON.stringify(
        {
          zoom,
          cssViewport: await page.evaluate(() => {
            return innerWidth;
          }),
          overflow: false,
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
    rmSync(folder, { recursive: true, force: true });
  }
});
