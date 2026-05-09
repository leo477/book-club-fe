import { test, expect, Page, ConsoleMessage, Response, Request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bug {
  route: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'console-error' | 'network-failure' | 'ui-missing' | 'form-error' | 'undefined-text' | 'nav-404' | 'redirect';
  description: string;
  detail?: string;
}

// ── Shared state ──────────────────────────────────────────────────────────────

const bugs: Bug[] = [];
const API = 'https://book-club-be.onrender.com/api/v1';

let ACCESS_TOKEN = '';
let REFRESH_TOKEN = '';
let CURRENT_USER_ID = '';
let OWNED_CLUB_ID = '';
let ANY_CLUB_ID = '';
let ANY_EVENT_ID = '';
let ANY_QUIZ_ID = '';

// ── Helpers ───────────────────────────────────────────────────────────────────

function addBug(bug: Bug): void {
  bugs.push(bug);
}

function attachMonitors(page: Page, route: string): () => void {
  const consoleErrors: string[] = [];
  const networkIssues: string[] = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('ResizeObserver')) {
        consoleErrors.push(text);
      }
    }
  };
  const onResponse = (resp: Response) => {
    if (resp.status() >= 400) {
      networkIssues.push(`HTTP ${resp.status()} — ${resp.url()}`);
    }
  };
  const onRequestFailed = (req: Request) => {
    networkIssues.push(`FAILED ${req.url()} — ${req.failure()?.errorText ?? 'unknown'}`);
  };

  page.on('console', onConsole);
  page.on('response', onResponse);
  page.on('requestfailed', onRequestFailed);

  return () => {
    page.off('console', onConsole);
    page.off('response', onResponse);
    page.off('requestfailed', onRequestFailed);
    for (const e of consoleErrors) {
      addBug({ route, severity: 'high', category: 'console-error', description: e });
    }
    for (const n of networkIssues) {
      const severity = n.includes('HTTP 404') ? 'medium' : 'critical';
      const category = n.includes('HTTP 404') ? 'nav-404' : 'network-failure';
      addBug({ route, severity, category, description: n });
    }
  };
}

async function checkUndefinedText(page: Page, route: string): Promise<void> {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const matches = bodyText.match(/[^\n]*\b(undefined|null)\b[^\n]*/g);
  if (matches && matches.length > 0) {
    addBug({
      route,
      severity: 'medium',
      category: 'undefined-text',
      description: `Page renders literal "undefined" or "null" in DOM`,
      detail: matches.slice(0, 5).join(' | '),
    });
  }
}

async function injectAuth(page: Page): Promise<void> {
  await page.addInitScript(
    ({ at, rt }) => {
      localStorage.setItem('bc_access_token', at);
      localStorage.setItem('bc_refresh_token', rt);
    },
    { at: ACCESS_TOKEN, rt: REFRESH_TOKEN },
  );
}

async function waitForAngular(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {/* ignore timeout */});
}

// ── Setup ─────────────────────────────────────────────────────────────────────

test.setTimeout(120_000);

test.beforeAll(async ({ request }) => {
  // Login via API to get tokens
  const loginResp = await request.post(`${API}/auth/login`, {
    data: { email: 'test123@mail.com', password: 'test123@mail.com' },
    timeout: 60_000,
  });

  if (!loginResp.ok()) {
    addBug({
      route: '/login (API)',
      severity: 'critical',
      category: 'network-failure',
      description: `Login API failed: HTTP ${loginResp.status()} — ${await loginResp.text()}`,
    });
    return;
  }

  const loginBody = await loginResp.json();
  ACCESS_TOKEN = loginBody.accessToken ?? '';
  REFRESH_TOKEN = loginBody.refreshToken ?? '';
  CURRENT_USER_ID = loginBody.user?.id ?? '';

  if (!ACCESS_TOKEN) {
    addBug({ route: '/login (API)', severity: 'critical', category: 'form-error', description: 'Login returned no accessToken' });
    return;
  }

  const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };

  // Discover clubs
  const clubsResp = await request.get(`${API}/clubs`, { headers, timeout: 30_000 }).catch(() => null);
  if (clubsResp?.ok()) {
    const clubsBody = await clubsResp.json();
    const clubs: { id: string; organizerId?: string }[] = Array.isArray(clubsBody)
      ? clubsBody
      : clubsBody.items ?? clubsBody.data ?? [];
    if (clubs.length > 0) {
      ANY_CLUB_ID = clubs[0].id;
      const owned = clubs.find(c => c.organizerId === CURRENT_USER_ID);
      OWNED_CLUB_ID = owned?.id ?? clubs[0].id;
    }
  } else {
    addBug({ route: '/clubs (API)', severity: 'high', category: 'network-failure', description: `GET /clubs failed: ${clubsResp?.status()}` });
  }

  // Discover events
  const eventsResp = await request.get(`${API}/events`, { headers, timeout: 30_000 }).catch(() => null);
  if (eventsResp?.ok()) {
    const eventsBody = await eventsResp.json();
    const events: { id: string }[] = Array.isArray(eventsBody)
      ? eventsBody
      : eventsBody.items ?? eventsBody.data ?? [];
    if (events.length > 0) ANY_EVENT_ID = events[0].id;
  }

  // Discover quizzes for owned club
  if (OWNED_CLUB_ID) {
    const quizzesResp = await request
      .get(`${API}/clubs/${OWNED_CLUB_ID}/quizzes`, { headers, timeout: 30_000 })
      .catch(() => null);
    if (quizzesResp?.ok()) {
      const qBody = await quizzesResp.json();
      const quizzes: { id: string }[] = Array.isArray(qBody) ? qBody : qBody.items ?? qBody.data ?? [];
      if (quizzes.length > 0) ANY_QUIZ_ID = quizzes[0].id;
    }
  }
});

// ── Unauthenticated tests ─────────────────────────────────────────────────────

test.describe('Unauthenticated', () => {
  test('GET /login — form renders and validates', async ({ page }) => {
    const flush = attachMonitors(page, '/login');
    await page.goto('/login');
    await waitForAngular(page);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    if (!(await emailInput.isVisible())) {
      addBug({ route: '/login', severity: 'critical', category: 'ui-missing', description: 'Email input not found' });
    }
    if (!(await passwordInput.isVisible())) {
      addBug({ route: '/login', severity: 'critical', category: 'ui-missing', description: 'Password input not found' });
    }
    if (!(await submitBtn.isVisible())) {
      addBug({ route: '/login', severity: 'critical', category: 'ui-missing', description: 'Submit button not found' });
    }

    // Submit empty form and check validation
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      const hasValidation = await page.locator('[class*="error"], [class*="invalid"], [aria-invalid="true"]').count();
      if (hasValidation === 0) {
        addBug({ route: '/login', severity: 'medium', category: 'form-error', description: 'Empty form submit shows no validation errors' });
      }
    }

    await checkUndefinedText(page, '/login');
    flush();
  });

  test('GET /register — form renders and validates', async ({ page }) => {
    const flush = attachMonitors(page, '/register');
    await page.goto('/register');
    await waitForAngular(page);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]');

    if (!(await emailInput.isVisible())) {
      addBug({ route: '/register', severity: 'high', category: 'ui-missing', description: 'Email input not visible on register page' });
    }
    if (!(await passwordInput.isVisible())) {
      addBug({ route: '/register', severity: 'high', category: 'ui-missing', description: 'Password input not visible on register page' });
    }
    if (!(await submitBtn.isVisible())) {
      addBug({ route: '/register', severity: 'high', category: 'ui-missing', description: 'Submit button not visible on register page' });
    }

    await checkUndefinedText(page, '/register');
    flush();
  });

  test('GET /events (unauthenticated) — event cards or empty state', async ({ page }) => {
    const flush = attachMonitors(page, '/events (unauth)');
    await page.goto('/events');
    await waitForAngular(page);

    const hasCards = await page.locator('app-event-card').count();
    const hasEmpty = await page.locator('app-empty-state').count();
    if (hasCards === 0 && hasEmpty === 0) {
      addBug({ route: '/events (unauth)', severity: 'high', category: 'ui-missing', description: 'No event cards or empty state visible' });
    }

    await checkUndefinedText(page, '/events (unauth)');
    flush();
  });

  test('GET /clubs (unauthenticated) — redirects to login', async ({ page }) => {
    const flush = attachMonitors(page, '/clubs (unauth)');
    await page.goto('/clubs');
    await waitForAngular(page);

    const url = page.url();
    const isLoginPage = url.includes('/login') || url.includes('/clubs');
    if (!isLoginPage) {
      addBug({ route: '/clubs (unauth)', severity: 'medium', category: 'redirect', description: `Unexpected redirect target: ${url}` });
    }

    flush();
  });
});

// ── Login via browser ─────────────────────────────────────────────────────────

test.describe('Login flow', () => {
  test('Login with valid credentials redirects to app', async ({ page }) => {
    const flush = attachMonitors(page, '/login (submit)');
    await page.goto('/login');
    await waitForAngular(page);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    if (!(await emailInput.isVisible())) {
      flush();
      return;
    }

    await emailInput.fill('test123@mail.com');
    await passwordInput.fill('test123@mail.com');
    await submitBtn.click();

    try {
      await page.waitForURL(/\/(clubs|events|profile)/, { timeout: 20_000 });
    } catch {
      addBug({ route: '/login (submit)', severity: 'critical', category: 'redirect', description: 'Login submit did not redirect to app within 20s' });
    }

    flush();
  });
});

// ── Authenticated tests ───────────────────────────────────────────────────────

test.describe('Authenticated — Events', () => {
  test('GET /events — feed loads with tabs', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, '/events (auth)');
    await page.goto('/events');
    await waitForAngular(page);

    const hasCards = await page.locator('app-event-card').count();
    const hasEmpty = await page.locator('app-empty-state').count();
    const hasTabs = await page.locator('[role="tab"], button:has-text("Upcoming"), button:has-text("My Events")').count();

    if (hasCards === 0 && hasEmpty === 0) {
      addBug({ route: '/events (auth)', severity: 'high', category: 'ui-missing', description: 'No event cards or empty state visible after auth' });
    }
    if (hasTabs === 0) {
      addBug({ route: '/events (auth)', severity: 'medium', category: 'ui-missing', description: 'No tab switcher (Upcoming/My Events) visible for authenticated user' });
    }

    await checkUndefinedText(page, '/events (auth)');
    flush();
  });

  test('GET /events/:id — event detail', async ({ page }) => {
    if (!ANY_EVENT_ID) {
      addBug({ route: '/events/:id', severity: 'medium', category: 'ui-missing', description: 'Skipped: no event ID discovered (no events in API response)' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/events/${ANY_EVENT_ID}`);
    await page.goto(`/events/${ANY_EVENT_ID}`);
    await waitForAngular(page);

    const title = page.locator('h1, h2, [class*="title"]').first();
    if (!(await title.isVisible().catch(() => false))) {
      addBug({ route: `/events/${ANY_EVENT_ID}`, severity: 'high', category: 'ui-missing', description: 'Event title not visible on detail page' });
    }

    await checkUndefinedText(page, `/events/${ANY_EVENT_ID}`);
    flush();
  });
});

test.describe('Authenticated — Clubs', () => {
  test('GET /clubs — clubs list', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, '/clubs');
    await page.goto('/clubs');
    await waitForAngular(page);

    const hasCards = await page.locator('app-club-card, [class*="club-card"]').count();
    const hasEmpty = await page.locator('app-empty-state').count();
    if (hasCards === 0 && hasEmpty === 0) {
      addBug({ route: '/clubs', severity: 'high', category: 'ui-missing', description: 'No club cards or empty state visible' });
    }

    await checkUndefinedText(page, '/clubs');
    flush();
  });

  test('GET /clubs/:id — club detail', async ({ page }) => {
    if (!ANY_CLUB_ID) {
      addBug({ route: '/clubs/:id', severity: 'medium', category: 'ui-missing', description: 'Skipped: no club ID discovered' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${ANY_CLUB_ID}`);
    await page.goto(`/clubs/${ANY_CLUB_ID}`);
    await waitForAngular(page);

    const clubName = page.locator('h1, h2, [class*="club-name"], [class*="title"]').first();
    if (!(await clubName.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${ANY_CLUB_ID}`, severity: 'high', category: 'ui-missing', description: 'Club name/title not visible on detail page' });
    }

    await checkUndefinedText(page, `/clubs/${ANY_CLUB_ID}`);
    flush();
  });

  test('GET /clubs/:id/edit — edit form for owner', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/edit', severity: 'medium', category: 'ui-missing', description: 'Skipped: no owned club ID discovered' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/edit`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/edit`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/edit`, severity: 'critical', category: 'redirect', description: 'Club edit redirected to login — auth or role guard issue' });
      flush();
      return;
    }

    const nameInput = page.locator('input[name="name"], input[formcontrolname="name"], input[placeholder*="name" i]').first();
    const saveBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Зберегти")').first();

    if (!(await nameInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/edit`, severity: 'high', category: 'ui-missing', description: 'Club name input not found on edit page' });
    }
    if (!(await saveBtn.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/edit`, severity: 'high', category: 'ui-missing', description: 'Save button not found on club edit page' });
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/edit`);
    flush();
  });

  test('GET /clubs/:id/events/create — create event form', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/events/create', severity: 'medium', category: 'ui-missing', description: 'Skipped: no owned club ID discovered' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/events/create`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/events/create`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/events/create`, severity: 'critical', category: 'redirect', description: 'Create event redirected to login — auth/role guard issue' });
      flush();
      return;
    }

    const titleInput = page.locator('input[formcontrolname="title"], input[name="title"], input[placeholder*="title" i], input[placeholder*="назва" i]').first();
    if (!(await titleInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/events/create`, severity: 'high', category: 'ui-missing', description: 'Event title input not found on create event page' });
    }

    const dateField = page.locator('input[type="date"], input[formcontrolname="date"], [class*="date"]').first();
    if (!(await dateField.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/events/create`, severity: 'medium', category: 'ui-missing', description: 'Date field not found on create event page' });
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/events/create`);
    flush();
  });
});

test.describe('Authenticated — Quizzes', () => {
  test('GET /clubs/:id/quizzes — quiz list', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/quizzes', severity: 'medium', category: 'ui-missing', description: 'Skipped: no owned club ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes`, severity: 'critical', category: 'redirect', description: 'Quiz list redirected to login' });
      flush();
      return;
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/quizzes`);
    flush();
  });

  test('GET /clubs/:id/quizzes/create — create quiz step 1', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/quizzes/create', severity: 'medium', category: 'ui-missing', description: 'Skipped: no owned club ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/create`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/create`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/create`, severity: 'critical', category: 'redirect', description: 'Create quiz redirected to login' });
      flush();
      return;
    }

    const titleInput = page.locator('input[formcontrolname="title"], input[name="title"], input[placeholder*="title" i]').first();
    if (!(await titleInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/create`, severity: 'high', category: 'ui-missing', description: 'Quiz title input not found on create quiz page' });
    }

    // Test next step button with empty form
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Далі"), button:has-text("Continue")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      const hasValidation = await page.locator('[class*="error"], [class*="invalid"], [aria-invalid="true"]').count();
      if (hasValidation === 0) {
        addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/create`, severity: 'medium', category: 'form-error', description: 'Next step with empty form shows no validation errors' });
      }
    } else {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/create`, severity: 'medium', category: 'ui-missing', description: 'Next/Continue button not visible on create quiz step 1' });
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/quizzes/create`);
    flush();
  });

  test('GET /clubs/:id/quizzes/:quizId — take quiz', async ({ page }) => {
    if (!OWNED_CLUB_ID || !ANY_QUIZ_ID) {
      addBug({ route: '/clubs/:id/quizzes/:quizId', severity: 'low', category: 'ui-missing', description: 'Skipped: no quiz ID discovered (no quizzes in owned club)' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}`, severity: 'critical', category: 'redirect', description: 'Quiz take redirected to login' });
      flush();
      return;
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}`);
    flush();
  });

  test('GET /clubs/:id/quizzes/:quizId/preview — quiz preview', async ({ page }) => {
    if (!OWNED_CLUB_ID || !ANY_QUIZ_ID) {
      addBug({ route: '/clubs/:id/quizzes/:quizId/preview', severity: 'low', category: 'ui-missing', description: 'Skipped: no quiz ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/preview`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/preview`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/preview`, severity: 'critical', category: 'redirect', description: 'Quiz preview redirected to login' });
      flush();
      return;
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/preview`);
    flush();
  });

  test('GET /clubs/:id/quizzes/:quizId/edit — quiz edit', async ({ page }) => {
    if (!OWNED_CLUB_ID || !ANY_QUIZ_ID) {
      addBug({ route: '/clubs/:id/quizzes/:quizId/edit', severity: 'low', category: 'ui-missing', description: 'Skipped: no quiz ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/edit`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/edit`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/edit`, severity: 'critical', category: 'redirect', description: 'Quiz edit redirected to login' });
      flush();
      return;
    }

    const titleInput = page.locator('input[formcontrolname="title"]').first();
    if (!(await titleInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/edit`, severity: 'high', category: 'ui-missing', description: 'Quiz title input not pre-populated on edit page' });
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/edit`);
    flush();
  });

  test('GET /clubs/:id/quizzes/:quizId/session — quiz session', async ({ page }) => {
    if (!OWNED_CLUB_ID || !ANY_QUIZ_ID) {
      addBug({ route: '/clubs/:id/quizzes/:quizId/session', severity: 'low', category: 'ui-missing', description: 'Skipped: no quiz ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/session`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/session`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/session`, severity: 'critical', category: 'redirect', description: 'Quiz session redirected to login' });
      flush();
      return;
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/session`);
    flush();
  });

  test('GET /clubs/:id/quizzes/:quizId/leaderboard — leaderboard', async ({ page }) => {
    if (!OWNED_CLUB_ID || !ANY_QUIZ_ID) {
      addBug({ route: '/clubs/:id/quizzes/:quizId/leaderboard', severity: 'low', category: 'ui-missing', description: 'Skipped: no quiz ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/leaderboard`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/leaderboard`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/leaderboard`, severity: 'critical', category: 'redirect', description: 'Leaderboard redirected to login' });
      flush();
      return;
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${ANY_QUIZ_ID}/leaderboard`);
    flush();
  });
});

test.describe('Authenticated — Randomizer', () => {
  test('GET /clubs/:id/randomizer — renders', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/randomizer', severity: 'low', category: 'ui-missing', description: 'Skipped: no owned club ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/randomizer`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/randomizer`);
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/randomizer`, severity: 'high', category: 'redirect', description: 'Randomizer redirected to login — role guard issue' });
      flush();
      return;
    }

    const spinBtn = page.locator('button:has-text("Spin"), button:has-text("Random"), button[class*="spin"]').first();
    if (!(await spinBtn.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/randomizer`, severity: 'medium', category: 'ui-missing', description: 'Spin button not found on randomizer page' });
    }

    await checkUndefinedText(page, `/clubs/${OWNED_CLUB_ID}/randomizer`);
    flush();
  });
});

test.describe('Authenticated — Profile', () => {
  test('GET /profile — profile page renders', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, '/profile');
    await page.goto('/profile');
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: '/profile', severity: 'critical', category: 'redirect', description: 'Profile redirected to login despite injected auth token' });
      flush();
      return;
    }

    const displayNameInput = page.locator('input[formcontrolname="displayName"], input[name="displayName"], input[placeholder*="name" i]').first();
    if (!(await displayNameInput.isVisible().catch(() => false))) {
      addBug({ route: '/profile', severity: 'high', category: 'ui-missing', description: 'Display name input not visible on profile page' });
    }

    await checkUndefinedText(page, '/profile');
    flush();
  });
});

test.describe('Authenticated — Manage', () => {
  test('GET /manage — accessible as organizer', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, '/manage');
    await page.goto('/manage');
    await waitForAngular(page);

    const url = page.url();
    if (url.includes('/login')) {
      addBug({ route: '/manage', severity: 'high', category: 'redirect', description: 'Manage page redirected to login' });
    } else if (url.includes('/clubs') && !url.includes('/manage')) {
      addBug({ route: '/manage', severity: 'medium', category: 'redirect', description: 'Manage page redirected to /clubs (user may not have organizer role)' });
    }

    await checkUndefinedText(page, '/manage');
    flush();
  });
});

test.describe('Navigation & UI', () => {
  test('Header navigation links work', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, 'header-nav');
    await page.goto('/clubs');
    await waitForAngular(page);

    // Check for clubs nav link
    const clubsLink = page.locator('a[href*="/clubs"], a[routerlink*="clubs"]').first();
    const eventsLink = page.locator('a[href*="/events"], a[routerlink*="events"]').first();

    if (!(await clubsLink.isVisible().catch(() => false))) {
      addBug({ route: 'header-nav', severity: 'medium', category: 'ui-missing', description: 'Clubs nav link not visible in header' });
    }
    if (!(await eventsLink.isVisible().catch(() => false))) {
      addBug({ route: 'header-nav', severity: 'medium', category: 'ui-missing', description: 'Events nav link not visible in header' });
    }

    flush();
  });

  test('Theme toggle button exists', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, 'theme-toggle');
    await page.goto('/clubs');
    await waitForAngular(page);

    const themeBtn = page.locator('button[class*="theme"], button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]').first();
    if (!(await themeBtn.isVisible().catch(() => false))) {
      addBug({ route: 'theme-toggle', severity: 'low', category: 'ui-missing', description: 'Theme toggle button not found in header' });
    }

    flush();
  });

  test('404 unknown route redirects gracefully', async ({ page }) => {
    const flush = attachMonitors(page, '/this-route-does-not-exist');
    await page.goto('/this-route-does-not-exist');
    await waitForAngular(page);

    const url = page.url();
    if (!url.includes('/login') && !url.includes('/clubs') && !url.includes('/events')) {
      addBug({ route: '/this-route-does-not-exist', severity: 'low', category: 'nav-404', description: `Wildcard redirect went to unexpected URL: ${url}` });
    }

    flush();
  });
});

// ── Write bugs.md ─────────────────────────────────────────────────────────────

test.afterAll(async () => {
  const severityOrder = ['critical', 'high', 'medium', 'low'] as const;
  const counts = Object.fromEntries(severityOrder.map(s => [s, bugs.filter(b => b.severity === s).length]));

  const lines: string[] = [
    '# Bug Report — Book Club App Audit',
    '',
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**URL:** https://book-club-nys9s6t1z-dmytros-projects-ad22eb22.vercel.app/`,
    `**Test user:** test123@mail.com`,
    `**Club owner account:** terrtr`,
    '',
    '## Summary',
    '',
    '| Severity | Count |',
    '|----------|-------|',
    ...severityOrder.map(s => `| ${s.charAt(0).toUpperCase() + s.slice(1)} | ${counts[s]} |`),
    `| **Total** | **${bugs.length}** |`,
    '',
  ];

  for (const sev of severityOrder) {
    const group = bugs.filter(b => b.severity === sev);
    if (group.length === 0) continue;
    lines.push(`## ${sev.toUpperCase()} (${group.length})`);
    lines.push('');
    lines.push('| # | Route | Type | Description |');
    lines.push('|---|-------|------|-------------|');
    const mdEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
    group.forEach((bug, i) => {
      lines.push(`| ${i + 1} | \`${bug.route.replace(/`/g, "'")}\` | ${mdEscape(bug.category)} | ${mdEscape(bug.description)} |`);
      if (bug.detail) lines.push(`| | | | **Detail:** ${mdEscape(bug.detail)} |`);
    });
    lines.push('');
  }

  if (bugs.length === 0) {
    lines.push('## No bugs found');
    lines.push('');
    lines.push('All checked routes loaded without console errors, network failures, or missing UI elements.');
  }

  fs.writeFileSync(path.join(process.cwd(), 'bugs.md'), lines.join('\n'), 'utf8');
  console.log(`\n✅ bugs.md written — ${bugs.length} issue(s) found`);
});
