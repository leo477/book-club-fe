import { defineConfig, devices } from '@playwright/test';

export const parityTargets = {
  legacy: process.env['PARITY_LEGACY_URL'] ?? 'http://localhost:4200',
  next: process.env['PARITY_NEXT_URL'] ?? 'http://localhost:3000',
};

export default defineConfig({
  testDir: './e2e/parity',
  testMatch: ['**/*.spec.ts'],
  updateSnapshots: 'none',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/parity' }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' } },
  use: {
    trace: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'legacy',
      use: { ...devices['Desktop Chrome'], baseURL: parityTargets.legacy, bypassCSP: process.env['PARITY_LEGACY_BYPASS_CSP'] === '1' },
    },
    {
      name: 'next',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: parityTargets.next,
        // bypass header is injected per request in e2e/parity/bypass.ts, never for third-party origins
      },
    },
  ],
});
