import { defineConfig, devices } from '@playwright/test';

// Trusted Types violation capture (SCRUM-67): needs the same hermetic stack as the parity run, see docs/migration/TRUSTED-TYPES-CAPTURE.md.
export default defineConfig({
  testDir: './e2e/tt',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env['PARITY_NEXT_URL'] ?? 'http://localhost:3000',
    // the report-only Trusted Types header is the thing under test, Playwright must not bypass it
    bypassCSP: false,
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: 'next' }],
});
