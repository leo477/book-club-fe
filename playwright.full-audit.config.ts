import { defineConfig, devices } from '@playwright/test';

// Full functional + API + a11y audit: registers throwaway member/organizer
// test users against the live backend, seeds a club/event/quiz, then drives
// every page and every key backend endpoint. Heavier and slower than the
// default e2e suite — run manually via `npm run audit:full`, not in CI.
//
// Setup registers accounts and seeds data, so AUDIT_API_BASE_URL is REQUIRED
// (no default) and a non-local host is refused. Run against a local backend:
//   AUDIT_API_BASE_URL=http://localhost:8000/api/v1 npm run audit:full
// To deliberately target a shared backend, name its exact hostname:
//   AUDIT_API_BASE_URL=https://host/api/v1 ALLOW_PROD_SEED=host npm run audit:full
const baseURL = process.env.AUDIT_BASE_URL ?? 'http://localhost:4200';
const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');

// Backend API base URL used directly by API specs and global setup.
// Fails closed: there is no default backend.
function requireApiBaseURL(): string {
  const value = process.env.AUDIT_API_BASE_URL;
  if (!value) {
    throw new Error(
      'AUDIT_API_BASE_URL is required, e.g. AUDIT_API_BASE_URL=http://localhost:8000/api/v1 npm run audit:full ' +
        '(a non-local host additionally needs ALLOW_PROD_SEED=<hostname>).',
    );
  }
  return value;
}
export const apiBaseURL = requireApiBaseURL();

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
