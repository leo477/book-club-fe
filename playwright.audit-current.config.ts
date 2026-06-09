import { defineConfig, devices } from '@playwright/test';

// Focused accessibility/smoke audit of key public routes.
// Target a deployed URL with AUDIT_BASE_URL=<url>; defaults to a locally
// served app (started automatically below).
const baseURL = process.env.AUDIT_BASE_URL ?? 'http://localhost:4200';
const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/audit-current.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/audit-results.json' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  ...(isLocal && {
    webServer: {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  }),
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
