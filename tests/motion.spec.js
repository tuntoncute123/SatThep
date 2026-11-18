import { test, expect } from '@playwright/test';

async function expectReadable(locator) {
  await expect(locator).toBeVisible();
  await expect(locator).toHaveCSS('opacity', '1');
}

test('GSAP entrance and counters finish; AOS reveals remain visible after navigation', async ({
  page,
}) => {
  const errors = [];

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  await page.goto('/');
  await expect(page.locator('.public-site')).toHaveAttribute('data-motion-ready', 'true');
  await expectReadable(page.locator('.hero h1'));
  await expectReadable(page.locator('.hero-actions'));
  await expect(page.locator('.hero-image')).toHaveCSS('transform', 'none');

  await page.locator('.stats-strip').scrollIntoViewIfNeeded();
  await expect(page.locator('.animated-number')).toHaveText(['15+', '1.200+', '500+', '50.000+']);
  await page.locator('.category-grid').scrollIntoViewIfNeeded();

  for (const card of await page.locator('.category-card').all()) {
    await expectReadable(card);
    await expect(card).toHaveCSS('translate', '0px');
  }

  await page.locator('.category-card').first().click();
  await expect(page).toHaveURL(/san-pham/);
  await expectReadable(page.locator('.page-hero h1'));
  await page.getByRole('button', { name: 'Thép hình', exact: true }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(2);

  for (const card of await page.locator('.catalog-card').all()) {
    await card.scrollIntoViewIfNeeded();
    await expectReadable(card);
  }

  await page.getByRole('button', { name: 'Tất cả', exact: true }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(8);
  await page.locator('.catalog-card').last().scrollIntoViewIfNeeded();
  await expectReadable(page.locator('.catalog-card').last());

  await page.getByRole('link', { name: 'Về trang chủ', exact: true }).first().click();
  await expectReadable(page.locator('.hero h1'));
  await page.locator('.category-grid').scrollIntoViewIfNeeded();
  await expectReadable(page.locator('.category-card').last());
  expect(errors).toEqual([]);
});

test('Reduced motion keeps all content readable, including a live preference change', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.public-site')).toHaveAttribute('data-motion-ready', 'true');
  await expectReadable(page.locator('.hero h1'));
  await expect(page.locator('.hero-image')).toHaveCSS('transform', 'none');

  for (const reveal of await page.locator('[data-aos]').all()) {
    await expect(reveal).toHaveCSS('opacity', '1');
    await expect(reveal).toHaveCSS('translate', 'none');
    await expect(reveal).toHaveCSS('transition-duration', '0s');
  }

  await expect(page.locator('.animated-number')).toHaveText(['15+', '1.200+', '500+', '50.000+']);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectReadable(page.locator('.hero h1'));
  await expect(page.locator('.hero-image')).toHaveCSS('transform', 'none');
  await expect(page.locator('.animated-number')).toHaveText(['15+', '1.200+', '500+', '50.000+']);

  await page.getByRole('button', { name: 'Nhận báo giá', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Họ và tên *').pressSequentially('Nguyễn Văn An');
  await expect(page.getByLabel('Họ và tên *')).toHaveValue('Nguyễn Văn An');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Keyboard focus reveals offscreen cards without waiting for scroll animation', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.public-site')).toHaveAttribute('data-motion-ready', 'true');
  const card = page.locator('.project-card').last();

  await card.focus();
  await expect(card).toBeFocused();
  await expectReadable(card);
  await card.press('Enter');
  await expect(page).toHaveURL(/du-an/);
  await expect(page.getByRole('dialog')).toBeVisible();
});
