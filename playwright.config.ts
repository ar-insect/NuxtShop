import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

process.env.NUXT_PUBLIC_DISABLE_CAPTCHA ??= '1';

const testDir = defineBddConfig({
  features: 'tests/e2e/features/*.feature',
  steps: 'tests/e2e/steps/*.steps.ts',
});

const port = 4000;

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'always' }]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${port} --host 0.0.0.0`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
