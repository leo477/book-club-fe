import { memberTest, organizerTest } from '../fixtures/auth.fixture';
import { loadRunContext } from '../fixtures/seed-helper';
import { auditRoute } from '../audit-helper';

const runContext = loadRunContext();

// Broad-shallow a11y sweep across every authenticated route (critical-impact
// axe violations only — see audit-helper.ts). Deep functional behavior for
// these routes lives in the narrower per-route-group specs; this file exists
// purely to make sure "every page" gets at least one a11y pass.

const routesAnyAuthenticatedUser = [
  '/events',
  `/events/${runContext.eventId}`,
  '/clubs',
  `/clubs/${runContext.clubId}`,
  `/clubs/${runContext.clubId}/quizzes`,
  `/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/leaderboard`,
  '/support',
  '/support/new',
  '/profile',
  '/chats',
  '/not-a-real-route',
];

const routesOrganizerOnly = [
  '/manage',
  '/clubs/create',
  `/clubs/${runContext.clubId}/edit`,
  `/clubs/${runContext.clubId}/manage`,
  `/clubs/${runContext.clubId}/randomizer`,
  `/clubs/${runContext.clubId}/events/create`,
  `/clubs/${runContext.clubId}/quizzes/create`,
  `/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/edit`,
  `/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/preview`,
  `/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/session`,
];

memberTest.describe('a11y sweep — routes reachable by any authenticated user', () => {
  for (const route of routesAnyAuthenticatedUser) {
    memberTest(`a11y: ${route}`, async ({ page }, testInfo) => {
      await auditRoute(page, testInfo, route);
    });
  }
});

organizerTest.describe('a11y sweep — organizer-only routes', () => {
  for (const route of routesOrganizerOnly) {
    organizerTest(`a11y: ${route}`, async ({ page }, testInfo) => {
      await auditRoute(page, testInfo, route);
    });
  }
});
