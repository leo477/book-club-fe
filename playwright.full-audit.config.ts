import { defineConfig, devices } from '@playwright/test';

// Full functional + API + a11y audit: registers throwaway member/organizer
// test users against the live backend, seeds a club/event/quiz, then drives
// every page and every key backend endpoint. Heavier and slower than
// audit-current/audit-total — run manually via `npm run audit:full`, not in CI.
const baseURL = process.env.AUDIT_BASE_URL ?? 'http://localhost:4200';
const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');

// Backend API base URL used directly by API specs and global setup.
// Defaults to the same live backend the frontend environments already target.
export const apiBaseURL = process.env.AUDIT_API_BASE_URL ?? 'https://book-club-be.onrender.com/api/v1';

// Bare origin, for the handful of backend routes mounted OUTSIDE the
// `/api/v1` prefix (currently just /health and /ready — see app/routers/health.py,
// `APIRouter(prefix="")`). Everything else in the app is under apiBaseURL.
export const apiOrigin = new URL(apiBaseURL).origin;

export default defineConfig({
  testDir: './e2e',
  testMatch: ['ui/**/*.spec.ts', 'api/**/*.spec.ts'],
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  globalTimeout: 15 * 60_000,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/full-audit-results.json' }],
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
