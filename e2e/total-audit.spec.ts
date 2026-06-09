import { test, expect } from '@playwright/test';
import { auditRoute } from './audit-helper';

// Broad audit across all main routes: each must render without uncaught
// runtime errors and pass critical accessibility checks.
const ROUTES = ['/', '/login', '/register', '/clubs', '/events', '/privacy', '/terms'];

test.describe('total-audit — all main routes', () => {
  for (const route of ROUTES) {
    test(`renders and passes critical a11y on ${route}`, async ({ page }, testInfo) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      await auditRoute(page, testInfo, route);
      expect(pageErrors, `uncaught runtime errors on ${route}:\n${pageErrors.join('\n')}`).toEqual([]);
    });
  }
});
