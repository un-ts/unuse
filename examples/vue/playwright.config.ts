import { defineConfig, devices } from '@playwright/test';

const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,
  reporter: IS_CI
    ? [['list'], ['github']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:6003',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev --port 6003',
    url: 'http://localhost:6003',
    reuseExistingServer: !IS_CI,
  },
});
