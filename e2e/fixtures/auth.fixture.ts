import { test as base, expect } from '@playwright/test';
import path from 'node:path';

const AUTH_DIR = path.join(__dirname, '..', '.auth');
export const memberStorageStatePath = path.join(AUTH_DIR, 'member.json');
export const organizerStorageStatePath = path.join(AUTH_DIR, 'organizer.json');

// Chromium logs a generic "Failed to load resource: the server responded
// with a status of NNN ()" console.error for every non-2xx HTTP response —
// including the 401/403/404/409s that negative-path tests in this suite
// deliberately trigger (role-gate checks, the "organizer already owns a
// club" conflict, etc). That's expected noise, not an app bug, so it's
// filtered out; a real app-level `console.error(...)` call or an uncaught
// `pageerror` still fails the test.
const RESOURCE_LOAD_ERROR = /^Failed to load resource: the server responded with a status of \d+/;

// Auto-fixture: fails a test if the page threw an uncaught JS error or logged
// to console.error (excluding the network-status noise above), same signal
// total-audit.spec.ts already checks for unauthenticated routes — replicated
// here so every authenticated UI spec gets it for free instead of copy-pasting
// the listener/assert pair.
const withConsoleGuard = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(String(err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !RESOURCE_LOAD_ERROR.test(msg.text())) errors.push(msg.text());
      });
      await use();
      expect(errors, `console/page errors: ${errors.join('; ')}`).toEqual([]);
    },
    { auto: true },
  ],
});

// Pre-authenticated as the seeded regular member. Angular restores the
// session on load via the persisted bc_has_session/bc_refresh_token pair
// (see AuthService.init()) — no UI login step needed.
export const memberTest = withConsoleGuard.extend({
  storageState: async ({}, use) => {
    await use(memberStorageStatePath);
  },
});

// Pre-authenticated as the seeded club organizer/owner.
export const organizerTest = withConsoleGuard.extend({
  storageState: async ({}, use) => {
    await use(organizerStorageStatePath);
  },
});

export { expect };
