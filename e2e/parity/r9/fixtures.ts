// Deterministic cookie-session API for the R9 (/login, /register, /auth/callback) parity specs. Every /api/v1 call and the
// Google OAuth start URL are fulfilled through page.route, so no backend is reached and NO real credential or account is
// ever used. The "session" is a boolean that stands in for the httpOnly cookie the real backend sets: login, register and a
// valid OAuth code turn it on, and /auth/session-status, /auth/me and /auth/refresh follow it.
//
// Token policy per target: the Next target gets token-free JSON bodies (cookie transport); the Angular target still reads
// accessToken from login/register/refresh/exchange bodies, so it gets them (a documented delta, not a Next expectation).
import type { Page } from '@playwright/test';

export const ACCESS = 'MOCK-ACCESS-TOKEN-4f2a9c';
export const REFRESH = 'MOCK-REFRESH-TOKEN-7b81de';
export const GOOD = {
  email: 'reader@example.test',
  password: 'CorrectHorse1',
} as const;
export const TAKEN_EMAIL = 'taken@example.test';
export const BOOM_EMAIL = 'boom@example.test';
export const GOOD_CODE = 'good-code-0001';

export interface AuthMock {
  session: boolean;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: 'user' | 'organizer';
    avatarUrl: null;
    createdAt: string;
    socialsPublic: boolean;
    socials: Record<string, string>;
  };
  log: {
    method: string;
    path: string;
    query: string;
    body: string | null;
    url: string;
  }[];
  googleUrls: string[];
  /** also put tokens into JSON bodies even when the target is Next (hostile/legacy backend: Next must still not keep them) */
  tokensInBody: boolean;
  fail: Record<string, number>;
}

const makeUser = (): AuthMock['user'] => ({
  id: 'user-r9',
  email: GOOD.email,
  displayName: 'Максим Учасник',
  role: 'user',
  avatarUrl: null,
  createdAt: '2026-01-15T00:00:00Z',
  socialsPublic: false,
  socials: {},
});

export async function installAuthMock(
  page: Page,
  project: string,
  opts: {
    session?: boolean;
    tokensInBody?: boolean;
    latency?: Record<string, number>;
    fail?: Record<string, number>;
  } = {},
): Promise<AuthMock> {
  const legacy = project === 'legacy';
  const mock: AuthMock = {
    session: opts.session ?? false,
    user: makeUser(),
    log: [],
    googleUrls: [],
    tokensInBody: opts.tokensInBody ?? legacy,
    fail: opts.fail ?? {},
  };
  const tokens = () =>
    mock.tokensInBody ? { accessToken: ACCESS, refreshToken: REFRESH } : {};

  // hard navigation target after a successful sign-in: a stub so the run never depends on /events being served by the target
  await page.route(
    (url) => url.pathname === '/events',
    async (route) => {
      if (route.request().resourceType() !== 'document')
        return route.fallback();
      mock.log.push({
        method: 'NAV',
        path: '/events',
        query: '',
        body: null,
        url: route.request().url(),
      });
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html lang="uk"><title>events</title><body><h1 data-testid="events-stub">events stub</h1></body></html>',
      });
    },
  );

  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    const body = req.postData();
    mock.log.push({
      method: req.method(),
      path,
      query: url.search,
      body,
      url: req.url(),
    });
    const wait = opts.latency?.[`${req.method()} ${path}`];
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const reply = handle(mock, req.method(), path, body, tokens);
    await route.fulfill({
      status: reply.status,
      contentType: 'application/json',
      body: reply.body === undefined ? '' : JSON.stringify(reply.body),
    });
  });

  // the Google OAuth start is a top-level navigation to the backend: capture the target, never leave the test origin
  await page.route(/\/auth\/oauth\/google/, async (route) => {
    mock.googleUrls.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>google</title><h1>oauth stub</h1>',
    });
  });
  await page.routeWebSocket(/^(?!.*_next).*$/, (ws) => void ws.close());
  return mock;
}

function handle(
  m: AuthMock,
  method: string,
  path: string,
  raw: string | null,
  tokens: () => object,
): { status: number; body?: unknown } {
  const forced = m.fail[`${method} ${path}`];
  if (forced) return { status: forced, body: { detail: 'forced failure' } };
  const json = (): Record<string, unknown> => {
    try {
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  };
  if (method === 'GET' && path === '/auth/session-status')
    return { status: 200, body: { hasSession: m.session } };
  if (method === 'GET' && path === '/auth/me')
    return m.session
      ? { status: 200, body: m.user }
      : { status: 401, body: { detail: 'no' } };
  if (method === 'POST' && path === '/auth/refresh')
    return m.session
      ? { status: 200, body: { ...tokens(), user: m.user } }
      : { status: 401, body: { detail: 'no' } };
  if (method === 'POST' && path === '/auth/logout') return { status: 204 };
  if (method === 'POST' && path === '/auth/login') {
    const b = json();
    if (b['email'] === BOOM_EMAIL)
      return { status: 500, body: { detail: 'Server exploded' } };
    if (b['email'] === GOOD.email && b['password'] === GOOD.password) {
      m.session = true;
      return { status: 200, body: { ...tokens(), user: m.user } };
    }
    return { status: 401, body: { detail: 'Invalid credentials' } };
  }
  if (method === 'POST' && path === '/auth/register') {
    const b = json();
    if (b['email'] === TAKEN_EMAIL)
      return { status: 409, body: { detail: 'Email already registered' } };
    m.session = true;
    m.user = {
      ...m.user,
      email: String(b['email']),
      displayName: String(b['displayName']),
      role: b['role'] === 'organizer' ? 'organizer' : 'user',
    };
    return { status: 201, body: { ...tokens(), user: m.user } };
  }
  if (method === 'POST' && path === '/auth/oauth/exchange') {
    if (json()['code'] === GOOD_CODE) {
      m.session = true;
      return { status: 200, body: { ...tokens() } };
    }
    return { status: 400, body: { detail: 'Invalid or expired code' } };
  }
  if (path === '/config/maps-key')
    return { status: 404, body: { detail: 'no key in tests' } };
  return { status: 404, body: { detail: 'not mocked' } };
}
