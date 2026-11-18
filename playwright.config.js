import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const testData = join(tmpdir(), `thepviet-next-tests-${Date.now()}`);

export default defineConfig({
  testDir: './tests',
  workers: 1,
  fullyParallel: false,
  timeout: 40000,
  use: {
    baseURL: 'http://127.0.0.1:5175',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'npm run start -- --port 5175',
    url: 'http://127.0.0.1:5175/api/public/settings',
    env: {
      VERCEL: '',
      TURSO_DATABASE_URL: '',
      TURSO_AUTH_TOKEN: '',
      DATA_DIR: testData,
      ADMIN_EMAIL: 'admin@thepviet.vn',
      ADMIN_PASSWORD: 'ThepViet@2026',
      COOKIE_SECURE: '0',
      TRUST_PROXY: '0',
    },
    reuseExistingServer: false,
  },
});
