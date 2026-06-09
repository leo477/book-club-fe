import { test } from '@playwright/test';
import { auditRoute } from './audit-helper';

// Focused audit of the key public routes touched by recent work.
const ROUTES = ['/', '/login', '/clubs', '/events'];

test.describe('audit:current — key routes', () => {
  for (const route of ROUTES) {
    test(`no critical a11y violations on ${route}`, async ({ page }, testInfo) => {
      await auditRoute(page, testInfo, route);
    });
  }
});
