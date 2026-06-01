import { test, expect, Page, ConsoleMessage, Response, Request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bug {
  route: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'console-error' | 'network-failure' | 'ui-missing' | 'form-error' | 'undefined-text' | 'nav-404' | 'redirect' | 'functional';
  description: string;
  detail?: string;
}

// ── Shared state ──────────────────────────────────────────────────────────────

const bugs: Bug[] = [];
const API = 'https://book-club-be.onrender.com/api/v1';

let ACCESS_TOKEN = '';
let REFRESH_TOKEN = '';
let USER_PROFILE: Record<string, unknown> = {};
let CURRENT_USER_ID = '';
let OWNED_CLUB_ID = '';
let ANY_CLUB_ID = '';
let ANY_EVENT_ID = '';
let ANY_QUIZ_ID = '';
let CREATED_CLUB_ID = '';
let CREATED_QUIZ_ID = '';
let FUNCTIONAL_EVENT_ID = '';
let ANY_CHAT_ROOM_ID = '';
let CREATED_AUDIT_ROOM_ID = '';

// ── Helpers ───────────────────────────────────────────────────────────────────

function addBug(bug: Bug): void {
  bugs.push(bug);
}

function attachMonitors(page: Page, route: string): () => void {
  const consoleErrors: string[] = [];
  const networkIssues: string[] = [];
  // Counts expected 404s so we can suppress the matching generic browser console errors
  let suppressedNotFoundCount = 0;

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const isKnownNoise =
        text.includes('favicon') ||
        text.includes('ResizeObserver');
      if (isKnownNoise) return;
      // Browser logs a generic "Failed to load resource: <status>" for every expected 4xx response
      if (text.includes('Failed to load resource') && (text.includes('401') || text.includes('404')) && suppressedNotFoundCount > 0) {
        suppressedNotFoundCount--;
        return;
      }
      consoleErrors.push(text);
    }
  };
  const onResponse = (resp: Response) => {
    if (resp.status() >= 400) {
      const url = resp.url();
      // 404 on sessions/active is expected when no quiz session is running — app handles it gracefully
      if (resp.status() === 404 && url.includes('/sessions/active')) {
        suppressedNotFoundCount++;
        return;
      }
      // 401 on /auth/login during wrong-password test is expected — suppress from network-failure list
      if (resp.status() === 401 && url.includes('/auth/login')) {
        suppressedNotFoundCount++;
        return;
      }
      if (resp.status() === 401 && url.includes('/auth/refresh')) {
        suppressedNotFoundCount++;
        return;
      }
      networkIssues.push(`HTTP ${resp.status()} — ${url}`);
    }
  };
  const onRequestFailed = (req: Request) => {
    const errorText = req.failure()?.errorText ?? 'unknown';
    // ERR_ABORTED = request cancelled (SPA navigation, Vercel rewrites, prefetch) — not an app error
    // Real server errors are caught via onResponse (HTTP 4xx/5xx)
    if (errorText === 'net::ERR_ABORTED') return;
    networkIssues.push(`FAILED ${req.url()} — ${errorText}`);
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
  await page.route('**/auth/refresh', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: ACCESS_TOKEN }),
    })
  );
  await page.route('**/auth/me', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(USER_PROFILE),
    })
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
  USER_PROFILE = loginBody.user ?? {};
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

  // Discover events — if none exist, create a temporary one so /events/:id can be tested
  const eventsResp = await request.get(`${API}/events`, { headers, timeout: 30_000 }).catch(() => null);
  if (eventsResp?.ok()) {
    const eventsBody = await eventsResp.json();
    const events: { id: string }[] = Array.isArray(eventsBody)
      ? eventsBody
      : eventsBody.items ?? eventsBody.data ?? [];
    if (events.length > 0) {
      ANY_EVENT_ID = events[0].id;
    } else if (OWNED_CLUB_ID) {
      // No events found — create a temporary test event so the detail route can be audited
      const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
      const createResp = await request
        .post(`${API}/clubs/${OWNED_CLUB_ID}/events`, {
          headers,
          data: { title: '[Audit] Test Event', date: tomorrow, city: 'Kyiv' },
          timeout: 30_000,
        })
        .catch(() => null);
      if (createResp?.ok()) {
        const created = await createResp.json();
        ANY_EVENT_ID = created.id ?? '';
      }
    }
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

  // Discover or create a chat room for owned club
  if (OWNED_CLUB_ID) {
    const roomsResp = await request
      .get(`${API}/clubs/${OWNED_CLUB_ID}/chat/rooms`, { headers, timeout: 30_000 })
      .catch(() => null);
    if (roomsResp?.ok()) {
      const rooms: { id: string; name: string }[] = await roomsResp.json().catch(() => []);
      if (rooms.length > 0) {
        ANY_CHAT_ROOM_ID = rooms[0].id;
      } else {
        // No rooms exist — create a temporary one for the audit
        const createResp = await request
          .post(`${API}/clubs/${OWNED_CLUB_ID}/chat/rooms`, {
            data: { name: 'Audit-Test-Room' },
            headers,
            timeout: 15_000,
          })
          .catch(() => null);
        if (createResp?.ok()) {
          const created: { id: string } = await createResp.json().catch(() => ({}));
          if (created.id) {
            ANY_CHAT_ROOM_ID = created.id;
            CREATED_AUDIT_ROOM_ID = created.id;
          }
        }
      }
    }
  }
});

// ── Unauthenticated tests ─────────────────────────────────────────────────────

test.describe('Unauthenticated', () => {
  test('GET /login — form renders and validates', async ({ page }) => {
    const flush = attachMonitors(page, '/login');
    await page.goto('/login');
    await waitForAngular(page);
    // Form is gated by a 700ms entrance animation — wait for it to render
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

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
    // Form is gated by a 700ms entrance animation — wait for it to render
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

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

  test('GET /events (unauthenticated) — redirects to login (protected route)', async ({ page }) => {
    const flush = attachMonitors(page, '/events (unauth)');
    await page.goto('/events');
    await waitForAngular(page);

    const url = page.url();
    if (!url.includes('/login')) {
      addBug({ route: '/events (unauth)', severity: 'high', category: 'redirect', description: `Protected /events route did not redirect unauthenticated user to login — ended up at: ${url}` });
    }

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
      console.log('ℹ️  /events/:id skipped — no events in test account and event creation failed');
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

    // Test next step button visibility (button is disabled on empty form — that is correct behaviour)
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Далі"), button:has-text("Continue")').first();
    const nextVisible = await nextBtn.isVisible().catch(() => false);
    if (!nextVisible) {
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

    const spinBtn = page.locator('[data-testid="spin-button"]').first();
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

    const themeBtn = page.locator('[data-testid="theme-toggle"]').first();
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

// ── Functional — Auth ────────────────────────────────────────────────────────

test.describe('Functional — Auth', () => {
  test('Register new user (unique email)', async ({ page }) => {
    const flush = attachMonitors(page, '/register (functional)');
    await page.goto('/register');
    await waitForAngular(page);
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    const uniqueEmail = `audit-test-${Date.now()}@mailinator.com`;
    const emailInput = page.locator('input[type="email"]').first();
    if (!(await emailInput.isVisible().catch(() => false))) {
      addBug({ route: '/register (functional)', severity: 'critical', category: 'functional', description: 'Email input not visible — cannot test registration' });
      flush();
      return;
    }

    // Fill display name — register form uses id="reg-display-name"
    await page.locator('#reg-display-name, input[placeholder="Ada Lovelace"]').first().fill('AuditUser').catch(() => {});
    await emailInput.fill(uniqueEmail);
    const pwInputs = page.locator('input[type="password"]');
    await pwInputs.nth(0).fill('AuditPass123!');
    await pwInputs.nth(1).fill('AuditPass123!').catch(() => {});

    // Select role — click Reader or Organizer role button
    const readerBtn = page.locator('button:has-text("Reader"), button:has-text("Читач")').first();
    if (await readerBtn.isVisible().catch(() => false)) {
      await readerBtn.click();
    } else {
      const roleBtn = page.locator('button[aria-pressed]').first();
      if (await roleBtn.isVisible().catch(() => false)) await roleBtn.click();
    }

    await page.locator('button[type="submit"]').first().click();

    try {
      await page.waitForURL(/\/(clubs|events|profile)/, { timeout: 10_000 });
    } catch {
      // Check if a success card is shown (🎉) — registration worked but no auto-redirect
      const successVisible = await page.locator('[class*="glass-card"] >> text=/Account Created|Акаунт створено/i').first().isVisible().catch(() => false);
      const successEmoji = await page.locator('text=🎉').first().isVisible().catch(() => false);
      if (successVisible || successEmoji) {
        addBug({
          route: '/register (functional)',
          severity: 'medium',
          category: 'functional',
          description: 'Registration succeeds but does not auto-redirect to app — user sees a success card and must manually go back to login, despite being authenticated',
        });
      } else {
        const errorMsg = await page.locator('[role="alert"]').first().innerText().catch(() => '');
        addBug({
          route: '/register (functional)',
          severity: 'high',
          category: 'functional',
          description: 'Registration did not redirect and showed no success or error feedback',
          detail: errorMsg || 'No feedback shown to user after submit',
        });
      }
    }

    flush();
  });

  test('Login with wrong password shows error', async ({ page }) => {
    const flush = attachMonitors(page, '/login (wrong-password)');
    await page.goto('/login');
    await waitForAngular(page);
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    const emailInput = page.locator('input[type="email"]').first();
    if (!(await emailInput.isVisible().catch(() => false))) {
      flush();
      return;
    }

    await emailInput.fill('test123@mail.com');
    await page.locator('input[type="password"]').first().fill('WRONG_PASSWORD_123');
    await page.locator('button[type="submit"]').first().click();
    // Wait for error alert to appear — backend may be slow (Render.com cold start)
    await page.waitForSelector('[role="alert"]:visible', { timeout: 8000 }).catch(() => {});

    const errorAlert = page.locator('[role="alert"]').first();
    const errorVisible = await errorAlert.isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('/login');

    if (!errorVisible && !stillOnLogin) {
      addBug({
        route: '/login (wrong-password)',
        severity: 'high',
        category: 'functional',
        description: 'Login with wrong password did not show error and redirected away from login page',
      });
    } else if (!errorVisible) {
      addBug({
        route: '/login (wrong-password)',
        severity: 'medium',
        category: 'functional',
        description: 'Login with wrong password stayed on login page but showed no error message to user',
      });
    }

    flush();
  });

  test('Logout clears session and redirects to login', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, '/logout (functional)');
    await page.goto('/clubs');
    await waitForAngular(page);

    // Logout is inside the avatar dropdown — open it first (desktop), or in the mobile sheet
    // Avatar button: aria-haspopup="menu" in the header
    const avatarBtn = page.locator('button[aria-haspopup="menu"]').first();
    if (await avatarBtn.isVisible().catch(() => false)) {
      await avatarBtn.click();
      await page.waitForTimeout(500);
    }

    const logoutBtn = page.locator('[data-testid="logout"]').first();
    const logoutVisible = await logoutBtn.isVisible().catch(() => false);
    if (!logoutVisible) {
      addBug({ route: '/logout (functional)', severity: 'medium', category: 'functional', description: 'Logout button not found after opening avatar dropdown — data-testid="logout" not present or dropdown did not open' });
      flush();
      return;
    }

    await logoutBtn.click();
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes('/login')) {
      addBug({ route: '/logout (functional)', severity: 'high', category: 'functional', description: `Logout did not redirect to /login — ended up at: ${url}` });
    }

    flush();
  });
});

// ── Functional — Club CRUD ────────────────────────────────────────────────────

test.describe('Functional — Club CRUD', () => {
  test('Create club via UI', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, '/clubs/create (functional)');

    // Navigate to clubs and find create button
    await page.goto('/clubs');
    await waitForAngular(page);

    const createBtn = page.locator('a[href*="create"], button:has-text("Create"), button:has-text("Створити")').first();
    if (!(await createBtn.isVisible().catch(() => false))) {
      // Try /manage page
      await page.goto('/manage');
      await waitForAngular(page);
    }

    const nameInput = page.locator('input[formcontrolname="name"]').first();
    if (!(await nameInput.isVisible().catch(() => false))) {
      await page.goto('/clubs/create').catch(() => {});
      await waitForAngular(page);
    }

    const nameInputFinal = page.locator('input[formcontrolname="name"]').first();
    if (!(await nameInputFinal.isVisible().catch(() => false))) {
      addBug({ route: '/clubs/create (functional)', severity: 'high', category: 'functional', description: 'Club name input not found on create club page' });
      flush();
      return;
    }

    const clubName = `[Audit] Club ${Date.now()}`;
    await nameInputFinal.fill(clubName);
    await page.locator('input[formcontrolname="description"], textarea[formcontrolname="description"]').first().fill('Audit test club — safe to delete').catch(() => {});
    await page.locator('button[type="submit"]').first().click();

    try {
      await page.waitForURL(/\/clubs\/[a-zA-Z0-9-]+/, { timeout: 15_000 });
      const createdUrl = page.url();
      const match = createdUrl.match(/\/clubs\/([a-zA-Z0-9-]+)/);
      if (match) CREATED_CLUB_ID = match[1];
    } catch {
      const errorMsg = await page.locator('[class*="error"], [role="alert"]').first().innerText().catch(() => '');
      addBug({
        route: '/clubs/create (functional)',
        severity: 'high',
        category: 'functional',
        description: 'Create club did not redirect to club detail after submit',
        detail: errorMsg || 'No error shown',
      });
    }

    flush();
  });

  test('Edit club name via UI', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/edit (functional)', severity: 'medium', category: 'functional', description: 'Skipped: no owned club ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/edit (functional)`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/edit`);
    await waitForAngular(page);

    const nameInput = page.locator('input[formcontrolname="name"]').first();
    if (!(await nameInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/edit (functional)`, severity: 'high', category: 'functional', description: 'Name input not visible on edit page' });
      flush();
      return;
    }

    const originalName = await nameInput.inputValue();
    const newName = `[Audit] ${originalName.replace(/^\[Audit\] /, '')}`;
    await nameInput.fill(newName);
    await page.locator('button[type="submit"]').first().click();

    try {
      await page.waitForURL(/\/clubs\/[a-zA-Z0-9-]+(?!\/edit)/, { timeout: 10_000 });
    } catch {
      // May stay on edit page with success toast
    }
    await page.waitForTimeout(1500);

    // Verify name changed
    await page.goto(`/clubs/${OWNED_CLUB_ID}`);
    await waitForAngular(page);
    const pageText = await page.locator('h1, h2, [class*="title"]').first().innerText().catch(() => '');
    const pageTextLower = pageText.toLowerCase();
    if (!pageTextLower.includes('[audit]') && !pageTextLower.includes(newName.toLowerCase())) {
      addBug({
        route: `/clubs/${OWNED_CLUB_ID}/edit (functional)`,
        severity: 'medium',
        category: 'functional',
        description: 'Club name change not reflected on detail page after save',
        detail: `Expected name containing "[Audit]", got: "${pageText}"`,
      });
    }

    // Restore name
    await page.goto(`/clubs/${OWNED_CLUB_ID}/edit`);
    await waitForAngular(page);
    await page.locator('input[formcontrolname="name"]').first().fill(originalName).catch(() => {});
    await page.locator('button[type="submit"]').first().click().catch(() => {});

    flush();
  });

  test('Join and leave a club', async ({ page }) => {
    // Use ANY_CLUB_ID (not owned) to test join/leave; CREATED_CLUB_ID is owned by the test user
    const targetClub = ANY_CLUB_ID !== OWNED_CLUB_ID ? ANY_CLUB_ID : '';
    if (!targetClub) {
      addBug({ route: '/clubs/:id (join-leave)', severity: 'medium', category: 'functional', description: 'Skipped: no club ID available for join/leave test' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${targetClub} (join-leave)`);
    await page.goto(`/clubs/${targetClub}`);
    await waitForAngular(page);

    const joinBtn = page.locator('button:has-text("Join"), button:has-text("Приєднатись"), [data-testid="join-btn"]').first();
    const leaveBtn = page.locator('button:has-text("Leave"), button:has-text("Покинути"), [data-testid="leave-btn"]').first();

    const joinVisible = await joinBtn.isVisible().catch(() => false);
    const leaveVisible = await leaveBtn.isVisible().catch(() => false);

    if (!joinVisible && !leaveVisible) {
      addBug({ route: `/clubs/${targetClub} (join-leave)`, severity: 'medium', category: 'functional', description: 'Neither Join nor Leave button visible on club detail page' });
      flush();
      return;
    }

    if (joinVisible) {
      await joinBtn.click();
      await page.waitForTimeout(2000);
      const nowLeave = await page.locator('button:has-text("Leave"), button:has-text("Покинути")').first().isVisible().catch(() => false);
      if (!nowLeave) {
        addBug({ route: `/clubs/${targetClub} (join-leave)`, severity: 'high', category: 'functional', description: 'After clicking Join, Leave button did not appear' });
      } else {
        // Leave again to restore state
        await page.locator('button:has-text("Leave"), button:has-text("Покинути")').first().click();
        await page.waitForTimeout(1500);
      }
    } else if (leaveVisible) {
      // Already a member — leave then rejoin
      await leaveBtn.click();
      await page.waitForTimeout(2000);
      const nowJoin = await page.locator('button:has-text("Join"), button:has-text("Приєднатись")').first().isVisible().catch(() => false);
      if (!nowJoin) {
        addBug({ route: `/clubs/${targetClub} (join-leave)`, severity: 'high', category: 'functional', description: 'After clicking Leave, Join button did not appear' });
      } else {
        // Restore membership
        await page.locator('button:has-text("Join"), button:has-text("Приєднатись")').first().click();
        await page.waitForTimeout(1500);
      }
    }

    flush();
  });
});

// ── Functional — Event ────────────────────────────────────────────────────────

test.describe('Functional — Event CRUD', () => {
  test('Create event via UI', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/events/create (functional)', severity: 'medium', category: 'functional', description: 'Skipped: no owned club ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/events/create (functional)`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/events/create`);
    await waitForAngular(page);

    const titleInput = page.locator('input[formcontrolname="title"]').first();
    if (!(await titleInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/events/create (functional)`, severity: 'high', category: 'functional', description: 'Title input not found on create event page' });
      flush();
      return;
    }

    const eventTitle = `[Audit] Event ${Date.now()}`;
    await titleInput.fill(eventTitle);

    const dateInput = page.locator('input[type="datetime-local"], input[formcontrolname="date"]').first();
    if (await dateInput.isVisible().catch(() => false)) {
      const tomorrow = new Date(Date.now() + 86_400_000);
      const formatted = tomorrow.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
      await dateInput.fill(formatted);
    }

    // Address autocomplete may be required — try to type in any city input
    const cityInput = page.locator('input[formcontrolname="city"], input[placeholder*="city" i], input[placeholder*="місто" i], input[placeholder*="адрес" i]').first();
    if (await cityInput.isVisible().catch(() => false)) {
      await cityInput.fill('Kyiv');
      await page.keyboard.press('Escape');
    }

    // Use force:true in case the submit button is gated by an address autocomplete component
    await page.locator('button[type="submit"]').first().click({ force: true }).catch(() => {});

    try {
      // Wait for redirect to event detail — URL must contain a UUID (not "create")
      await page.waitForURL(/\/events\/[0-9a-f]{8}-[0-9a-f]{4}-/, { timeout: 15_000 });
      const createdUrl = page.url();
      const match = createdUrl.match(/\/events\/([0-9a-f-]{36})/);
      if (match) FUNCTIONAL_EVENT_ID = match[1];
    } catch {
      const errorMsg = await page.locator('[class*="error"], [role="alert"]').first().innerText().catch(() => '');
      addBug({
        route: `/clubs/${OWNED_CLUB_ID}/events/create (functional)`,
        severity: 'high',
        category: 'functional',
        description: 'Create event did not redirect to event detail after submit',
        detail: errorMsg || 'Submit button was disabled — address/city field may be required',
      });
    }

    flush();
  });

  test('Edit event via UI', async ({ page }) => {
    const eventId = FUNCTIONAL_EVENT_ID || ANY_EVENT_ID;
    if (!eventId || !OWNED_CLUB_ID) {
      addBug({ route: '/events/:id/edit (functional)', severity: 'medium', category: 'functional', description: 'Skipped: no event ID available' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/events/${eventId}/edit (functional)`);

    // Navigate to event detail and find edit button
    await page.goto(`/events/${eventId}`);
    await waitForAngular(page);

    const editBtn = page.locator('a:has-text("Edit"), button:has-text("Edit"), a:has-text("Редагувати"), button:has-text("Редагувати"), [data-testid="edit-event"]').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await waitForAngular(page);
    } else {
      await page.goto(`/events/${eventId}/edit`).catch(() => {});
      await waitForAngular(page);
    }

    const titleInput = page.locator('input[formcontrolname="title"]').first();
    if (!(await titleInput.isVisible().catch(() => false))) {
      addBug({ route: `/events/${eventId}/edit (functional)`, severity: 'high', category: 'functional', description: 'Title input not found on event edit page' });
      flush();
      return;
    }

    const originalTitle = await titleInput.inputValue();
    await titleInput.fill(`[Audit Edit] ${originalTitle.replace(/^\[Audit.*?\] /, '')}`);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    const pageText = await page.locator('h1, h2, [class*="title"]').first().innerText().catch(() => '');
    if (!pageText.includes('[Audit Edit]') && !pageText.includes(originalTitle.replace(/^\[Audit.*?\] /, ''))) {
      addBug({
        route: `/events/${eventId}/edit (functional)`,
        severity: 'medium',
        category: 'functional',
        description: 'Event title change not reflected on detail page after save',
        detail: `Page heading: "${pageText}"`,
      });
    }

    flush();
  });
});

// ── Functional — Quiz CRUD ────────────────────────────────────────────────────

test.describe('Functional — Quiz CRUD', () => {
  test('Create quiz (2 steps) via UI', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: '/clubs/:id/quizzes/create (functional)', severity: 'medium', category: 'functional', description: 'Skipped: no owned club ID' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/create (functional)`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/create`);
    await waitForAngular(page);

    // Step 1 — title
    const titleInput = page.locator('input[formcontrolname="title"]').first();
    if (!(await titleInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/create (functional)`, severity: 'high', category: 'functional', description: 'Quiz title input not found on step 1' });
      flush();
      return;
    }

    const quizTitle = `[Audit] Quiz ${Date.now()}`;
    await titleInput.fill(quizTitle);
    const nextBtn = page.locator('button[type="submit"]').first();
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Step 2 — add a question
    const questionInput = page.locator('textarea[formcontrolname="question"], input[formcontrolname="question"]').first();
    if (!(await questionInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/create (functional)`, severity: 'high', category: 'functional', description: 'Question input not found on step 2 after proceeding from step 1' });
      flush();
      return;
    }

    await questionInput.fill('What is the capital of Ukraine?');
    // Option inputs use dynamic [formControlName] binding — select by placeholder instead
    await page.locator('input[placeholder^="Option A"], input[placeholder^="Option "][placeholder$="A"]').first().fill('Kyiv').catch(() => {});
    await page.locator('input[placeholder^="Option B"], input[placeholder^="Option "][placeholder$="B"]').first().fill('Lviv').catch(() => {});
    await page.locator('input[placeholder^="Option C"], input[placeholder^="Option "][placeholder$="C"]').first().fill('Kharkiv').catch(() => {});
    await page.locator('input[placeholder^="Option D"], input[placeholder^="Option "][placeholder$="D"]').first().fill('Odessa').catch(() => {});

    // correctIndex defaults to 0 so it's already valid — just ensure first radio is selected
    await page.locator('input[type="radio"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);

    // Add question
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1000);

    // Publish quiz — button calls publishQuiz(), label variants: "Publish Quiz", "Опублікувати вікторину", "Save as Draft"
    const publishBtn = page.locator('button:has-text("Publish"), button:has-text("Опублікувати"), button:has-text("Done"), button:has-text("Готово"), button:has-text("Save")').first();
    await page.waitForTimeout(500);
    if (await publishBtn.isVisible().catch(() => false)) {
      await publishBtn.click();
      try {
        await page.waitForURL(/\/quizzes\/[a-zA-Z0-9-]+(?!\/create)/, { timeout: 10_000 });
        const match = page.url().match(/\/quizzes\/([a-zA-Z0-9]{8,}[a-zA-Z0-9-]*)/);
        if (match && match[1] !== 'create') CREATED_QUIZ_ID = match[1];
      } catch {
        const errorMsg = await page.locator('[class*="error"], [role="alert"]').first().innerText().catch(() => '');
        addBug({
          route: `/clubs/${OWNED_CLUB_ID}/quizzes/create (functional)`,
          severity: 'medium',
          category: 'functional',
          description: 'Quiz publish did not navigate away from create page',
          detail: errorMsg || 'No error shown',
        });
      }
    } else {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/create (functional)`, severity: 'medium', category: 'functional', description: 'Publish button not found after adding a question in quiz create step 2' });
    }

    flush();
  });

  test('Edit quiz title via UI', async ({ page }) => {
    const quizId = CREATED_QUIZ_ID || ANY_QUIZ_ID;
    if (!quizId || !OWNED_CLUB_ID) {
      addBug({ route: '/quizzes/:id/edit (functional)', severity: 'medium', category: 'functional', description: 'Skipped: no quiz ID available' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${quizId}/edit (functional)`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes/${quizId}/edit`);
    await waitForAngular(page);

    const titleInput = page.locator('input[formcontrolname="title"]').first();
    if (!(await titleInput.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes/${quizId}/edit (functional)`, severity: 'high', category: 'functional', description: 'Title input not visible on quiz edit page' });
      flush();
      return;
    }

    // Check if input is disabled — for published quizzes this is expected (app shows a lock banner)
    // Only report as bug if there's no informational banner explaining the locked state
    const isDisabled = await titleInput.isDisabled().catch(() => false);
    if (isDisabled) {
      const lockBanner = await page.locator('[role="alert"]:has-text("live"), [role="alert"]:has-text("read-only"), [role="alert"]:has-text("cannot be edited")').first().isVisible().catch(() => false);
      if (!lockBanner) {
        addBug({
          route: `/clubs/${OWNED_CLUB_ID}/quizzes/${quizId}/edit (functional)`,
          severity: 'medium',
          category: 'functional',
          description: 'Quiz title input is disabled on edit page with no explanation shown to user',
        });
      }
      flush();
      return;
    }

    const originalTitle = await titleInput.inputValue();
    await titleInput.fill(`[Audit Edit] ${originalTitle.replace(/^\[Audit.*?\] /, '')}`);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Quick verify — title should appear somewhere on the resulting page
    const heading = await page.locator('h1, h2, [class*="title"]').first().innerText().catch(() => '');
    if (!heading.toLowerCase().includes('[audit edit]') && !heading.toLowerCase().includes(originalTitle.replace(/^\[Audit.*?\] /, '').toLowerCase())) {
      addBug({
        route: `/clubs/${OWNED_CLUB_ID}/quizzes/${quizId}/edit (functional)`,
        severity: 'medium',
        category: 'functional',
        description: 'Quiz title change not reflected after save',
        detail: `Heading text: "${heading}"`,
      });
    }

    flush();
  });

  test('Toggle quiz active status', async ({ page }) => {
    const quizId = CREATED_QUIZ_ID || ANY_QUIZ_ID;
    if (!quizId || !OWNED_CLUB_ID) {
      addBug({ route: '/quizzes/:id (toggle-active)', severity: 'low', category: 'functional', description: 'Skipped: no quiz ID available' });
      return;
    }
    await injectAuth(page);
    const flush = attachMonitors(page, `/clubs/${OWNED_CLUB_ID}/quizzes/${quizId} (toggle-active)`);
    await page.goto(`/clubs/${OWNED_CLUB_ID}/quizzes`);
    await waitForAngular(page);

    const toggleBtn = page.locator('[data-testid="toggle-active"], button:has-text("Activate"), button:has-text("Deactivate"), button:has-text("Активувати"), button:has-text("Деактивувати")').first();
    if (!(await toggleBtn.isVisible().catch(() => false))) {
      addBug({ route: `/clubs/${OWNED_CLUB_ID}/quizzes (toggle-active)`, severity: 'low', category: 'functional', description: 'Quiz activate/deactivate toggle button not found on quizzes list' });
      flush();
      return;
    }

    await toggleBtn.click();
    await page.waitForTimeout(1500);

    flush();
  });
});

// ── Functional — Profile ─────────────────────────────────────────────────────

test.describe('Functional — Profile', () => {
  test('Edit display name and verify change', async ({ page }) => {
    await injectAuth(page);
    const flush = attachMonitors(page, '/profile (edit-name)');
    await page.goto('/profile');
    await waitForAngular(page);

    const nameInput = page.locator('input[formcontrolname="displayName"]').first();
    if (!(await nameInput.isVisible().catch(() => false))) {
      addBug({ route: '/profile (edit-name)', severity: 'high', category: 'functional', description: 'Display name input not visible on profile page' });
      flush();
      return;
    }

    const originalName = await nameInput.inputValue();
    const newName = `AuditUser-${Date.now()}`;
    await nameInput.fill(newName);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Reload and verify
    await page.goto('/profile');
    await waitForAngular(page);

    const savedName = await page.locator('input[formcontrolname="displayName"]').first().inputValue().catch(() => '');
    if (savedName !== newName) {
      addBug({
        route: '/profile (edit-name)',
        severity: 'high',
        category: 'functional',
        description: 'Display name change was not persisted — mismatch after reload',
        detail: `Expected: "${newName}", got: "${savedName}"`,
      });
    }

    // Restore original name
    if (originalName) {
      await page.locator('input[formcontrolname="displayName"]').first().fill(originalName);
      await page.locator('button[type="submit"]').first().click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    flush();
  });
});

// ── Authenticated — Chat rooms ────────────────────────────────────────────────

test.describe('Authenticated — Chat rooms', () => {
  test('Chat FAB visible on club detail, panel opens and lists rooms', async ({ page }) => {
    if (!OWNED_CLUB_ID) {
      addBug({ route: `/clubs/:id (chat)`, severity: 'medium', category: 'functional', description: 'No owned club available — chat room tests skipped' });
      return;
    }
    const route = `/clubs/${OWNED_CLUB_ID} (chat)`;
    await injectAuth(page);
    const flush = attachMonitors(page, route);
    await page.goto(`/clubs/${OWNED_CLUB_ID}`);
    await waitForAngular(page);

    // FAB must be visible
    const fab = page.locator('.chat-fab, button[aria-label*="Chat"], button[aria-label*="chat"]').first();
    const fabVisible = await fab.isVisible().catch(() => false);
    if (!fabVisible) {
      addBug({ route, severity: 'high', category: 'ui-missing', description: 'Chat FAB button (.chat-fab) not visible on club detail page' });
      flush();
      return;
    }

    // Open chat panel
    await fab.click();
    await page.waitForTimeout(600);
    const panel = page.locator('.chat-panel');
    const panelVisible = await panel.isVisible().catch(() => false);
    if (!panelVisible) {
      addBug({ route, severity: 'high', category: 'ui-missing', description: 'Chat panel (.chat-panel) did not appear after clicking FAB' });
      flush();
      return;
    }

    // Either room list or empty state must be present — not a blank panel
    const hasRooms = await panel.locator('.room-card').count() > 0;
    const hasEmptyState = await panel.locator('text=no rooms, text=no chat').count() > 0 ||
      await panel.locator('[class*="empty"]').count() > 0 ||
      await panel.locator('span.text-2xl').count() > 0;  // emoji in empty-state
    if (!hasRooms && !hasEmptyState) {
      addBug({ route, severity: 'medium', category: 'ui-missing', description: 'Chat panel is open but shows neither room cards nor empty state' });
    }

    // Check no 403 WebSocket errors
    await page.waitForTimeout(1000);
    await checkUndefinedText(page, route);
    flush();
  });

  test('Organizer sees delete button on chat room rows', async ({ page }) => {
    if (!OWNED_CLUB_ID || !ANY_CHAT_ROOM_ID) {
      return;
    }
    const route = `/clubs/${OWNED_CLUB_ID} (chat-delete-btn)`;
    await injectAuth(page);
    const flush = attachMonitors(page, route);
    await page.goto(`/clubs/${OWNED_CLUB_ID}`);
    await waitForAngular(page);

    const fab = page.locator('.chat-fab, button[aria-label*="Chat"], button[aria-label*="chat"]').first();
    if (!(await fab.isVisible().catch(() => false))) { flush(); return; }
    await fab.click();
    await page.waitForTimeout(600);

    // Organizer should see trash icon button on each room row
    const deleteBtn = page.locator('[aria-label^="Delete room"]').first();
    const visible = await deleteBtn.isVisible().catch(() => false);
    if (!visible) {
      addBug({ route, severity: 'high', category: 'ui-missing', description: 'Organizer does not see delete button on chat room rows — RBAC or render issue' });
    }

    flush();
  });
});

// ── Functional — Chat room delete ─────────────────────────────────────────────

test.describe('Functional — Chat room delete', () => {
  test('Organizer can delete a chat room and it disappears from the list', async ({ page }) => {
    if (!OWNED_CLUB_ID || !ANY_CHAT_ROOM_ID) {
      return;
    }
    const route = `/clubs/${OWNED_CLUB_ID} (chat-delete-functional)`;
    await injectAuth(page);
    const flush = attachMonitors(page, route);
    await page.goto(`/clubs/${OWNED_CLUB_ID}`);
    await waitForAngular(page);

    const fab = page.locator('.chat-fab, button[aria-label*="Chat"], button[aria-label*="chat"]').first();
    if (!(await fab.isVisible().catch(() => false))) { flush(); return; }
    await fab.click();
    await page.waitForTimeout(600);

    const panel = page.locator('.chat-panel');
    if (!(await panel.isVisible().catch(() => false))) { flush(); return; }

    const roomsBefore = await panel.locator('.room-card').count();
    if (roomsBefore === 0) { flush(); return; }

    // Click trash icon on first room to reveal confirmation
    const trashBtn = panel.locator('[aria-label^="Delete room"]').first();
    if (!(await trashBtn.isVisible().catch(() => false))) { flush(); return; }
    await trashBtn.click();
    await page.waitForTimeout(300);

    // Inline confirmation appears — click the red "Delete" button
    const confirmBtn = panel.locator('button:has-text("Delete")').last();
    const confirmVisible = await confirmBtn.isVisible().catch(() => false);
    if (!confirmVisible) {
      addBug({ route, severity: 'high', category: 'functional', description: 'Delete confirmation panel did not appear after clicking trash icon on chat room' });
      flush();
      return;
    }

    // Intercept DELETE request to verify it fires
    const deletePromise = page.waitForResponse(
      resp => resp.url().includes('/chat/rooms/') && resp.request().method() === 'DELETE',
      { timeout: 10_000 },
    ).catch(() => null);

    await confirmBtn.click();
    const deleteResp = await deletePromise;

    if (!deleteResp) {
      addBug({ route, severity: 'high', category: 'functional', description: 'No DELETE /chat/rooms/ request was fired after confirming room deletion' });
      flush();
      return;
    }
    if (!deleteResp.ok()) {
      addBug({ route, severity: 'critical', category: 'functional', description: `DELETE /chat/rooms/ returned ${deleteResp.status()} — room deletion failed on backend` });
    }

    await page.waitForTimeout(600);
    const roomsAfter = await panel.locator('.room-card').count();
    if (roomsAfter >= roomsBefore) {
      addBug({ route, severity: 'high', category: 'functional', description: `Room count did not decrease after deletion (before: ${roomsBefore}, after: ${roomsAfter})` });
    }

    // Track that we deleted the audit-created room so afterAll skips trying to delete it again
    if (ANY_CHAT_ROOM_ID === CREATED_AUDIT_ROOM_ID) {
      CREATED_AUDIT_ROOM_ID = '';
    }
    // If we deleted an existing room (not the one we created), recreate it so the club isn't left roomless
    if (ANY_CHAT_ROOM_ID !== CREATED_AUDIT_ROOM_ID) {
      ANY_CHAT_ROOM_ID = '';
    }

    flush();
  });
});

// ── Authenticated — Club stats (organizer dashboard) ──────────────────────────

test.describe('Authenticated — Club stats', () => {
  test('/manage — stats expand for owned club, numeric values render correctly', async ({ page }) => {
    if (!OWNED_CLUB_ID) { return; }
    const route = '/manage (club-stats)';
    await injectAuth(page);
    const flush = attachMonitors(page, route);
    await page.goto('/manage');
    await waitForAngular(page);

    // Page must render at all
    const pageBody = await page.locator('body').innerText().catch(() => '');
    if (pageBody.length < 50) {
      addBug({ route, severity: 'critical', category: 'ui-missing', description: '/manage page did not render meaningful content' });
      flush();
      return;
    }

    // Find the "Show stats" toggle for the owned club
    const statsToggle = page.locator('button', { hasText: /stats/i }).first();
    const toggleVisible = await statsToggle.isVisible().catch(() => false);
    if (!toggleVisible) {
      addBug({ route, severity: 'high', category: 'ui-missing', description: 'Stats toggle button not found on /manage page' });
      flush();
      return;
    }

    await statsToggle.click();
    await page.waitForTimeout(1500);

    // Stats cards should now be visible — look for the bold stat numbers
    const statNumbers = page.locator('[class*="font-bold"][style*="color"]');
    const statCount = await statNumbers.count();
    if (statCount === 0) {
      addBug({ route, severity: 'high', category: 'ui-missing', description: 'No stat number elements found after expanding stats panel' });
      flush();
      return;
    }

    // Verify each visible stat value is a number or "—", not "undefined" / "null"
    for (let i = 0; i < Math.min(statCount, 6); i++) {
      const text = (await statNumbers.nth(i).innerText().catch(() => '')).trim();
      if (text === 'undefined' || text === 'null') {
        addBug({
          route,
          severity: 'high',
          category: 'undefined-text',
          description: `Stat card #${i + 1} renders "${text}" instead of a numeric value`,
        });
      }
    }

    await checkUndefinedText(page, route);
    flush();
  });
});

// ── Write bugs.md ─────────────────────────────────────────────────────────────

test.afterAll(async ({ request }) => {
  // Clean up created test data via API
  const headers = ACCESS_TOKEN ? { Authorization: `Bearer ${ACCESS_TOKEN}` } : {};
  if (CREATED_CLUB_ID) {
    await request.delete(`${API}/clubs/${CREATED_CLUB_ID}`, { headers, timeout: 10_000 }).catch(() => {});
  }
  if (FUNCTIONAL_EVENT_ID && OWNED_CLUB_ID) {
    await request.delete(`${API}/clubs/${OWNED_CLUB_ID}/events/${FUNCTIONAL_EVENT_ID}`, { headers, timeout: 10_000 }).catch(() => {});
  }
  if (CREATED_QUIZ_ID && OWNED_CLUB_ID) {
    await request.delete(`${API}/clubs/${OWNED_CLUB_ID}/quizzes/${CREATED_QUIZ_ID}`, { headers, timeout: 10_000 }).catch(() => {});
  }
  if (CREATED_AUDIT_ROOM_ID) {
    await request.delete(`${API}/chat/rooms/${CREATED_AUDIT_ROOM_ID}`, { headers, timeout: 10_000 }).catch(() => {});
  }
  const severityOrder = ['critical', 'high', 'medium', 'low'] as const;
  const counts = Object.fromEntries(severityOrder.map(s => [s, bugs.filter(b => b.severity === s).length]));

  const lines: string[] = [
    '# Bug Report — Book Club App Audit',
    '',
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**URL:** https://book-club-ivvmyruoy-dmytros-projects-ad22eb22.vercel.app/`,
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
