import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';

// POST /auth/register happy-path (201/202) is already exercised twice per run
// by global-setup.ts (member + organizer) — here we cover the remaining
// contract surface: duplicate-email conflict, login, refresh, logout, /me,
// and the OAuth redirect entrypoint (not the full OAuth exchange flow, which
// isn't testable headlessly).

test.describe('auth API', () => {
  test('POST /auth/register — 409 on duplicate email', async ({ anonApi }) => {
    const runContext = loadRunContext();
    const resp = await anonApi.post('/auth/register', {
      data: {
        email: runContext.member.email,
        password: 'SomeOtherPass123!',
        displayName: 'Duplicate Attempt',
        role: 'user',
      },
    });
    expect(resp.status()).toBe(409);
  });

  test('POST /auth/register — 422 on malformed body', async ({ anonApi }) => {
    const resp = await anonApi.post('/auth/register', { data: { email: 'not-an-email' } });
    expect(resp.status()).toBe(422);
  });

  test('POST /auth/login — 401 on wrong password', async ({ anonApi }) => {
    const runContext = loadRunContext();
    const resp = await anonApi.post('/auth/login', {
      data: { email: runContext.member.email, password: 'definitely-wrong' },
    });
    expect(resp.status()).toBe(401);
  });

  test('POST /auth/login — 200 with correct credentials mints a fresh session', async ({ anonApi }) => {
    const runContext = loadRunContext();
    // The member's password is derived deterministically in global-setup.ts
    // (`PwAudit-${runId}!`); reconstruct it from the run id rather than storing
    // plaintext passwords in run-context.json alongside the tokens.
    const password = `PwAudit-${runContext.runId}!`;
    const resp = await anonApi.post('/auth/login', {
      data: { email: runContext.member.email, password },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user).toHaveProperty('id', runContext.member.userId);
  });

  test('POST /auth/refresh — 200 with a valid refresh token', async ({ anonApi }) => {
    // Uses a disposable probe registration rather than the shared member/organizer
    // refresh tokens: Supabase rotates refresh tokens on use, which would invalidate
    // the token cached in run-context.json / the member.json storageState and break
    // every other spec (UI specs silently refresh on every page load).
    const runContext = loadRunContext();
    const probeEmail = `pw.audit.${runContext.runId}.refresh-probe@gmail.com`;
    const register = await anonApi.post('/auth/register', {
      data: { email: probeEmail, password: 'RefreshProbe123!', displayName: 'Refresh Probe', role: 'user' },
    });
    expect(register.status()).toBe(201);
    const probeAuth = await register.json();

    const resp = await anonApi.post('/auth/refresh', {
      data: { refreshToken: probeAuth.refreshToken },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('accessToken');
  });

  test('GET /auth/me — 200 for an authenticated user', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get('/auth/me');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('id', runContext.member.userId);
    expect(body).toHaveProperty('role', 'user');
  });

  test('GET /auth/me — 401 without a token', async ({ anonApi }) => {
    const resp = await anonApi.get('/auth/me');
    expect(resp.status()).toBe(401);
  });

  test('GET /auth/oauth/google — redirects to Google', async ({ anonApi }) => {
    const resp = await anonApi.get('/auth/oauth/google', { maxRedirects: 0 });
    expect([302, 307]).toContain(resp.status());
  });

  test('POST /auth/logout — 401 without a token', async ({ anonApi }) => {
    const resp = await anonApi.post('/auth/logout');
    expect(resp.status()).toBe(401);
  });

  test('POST /auth/logout — 204 for an authenticated user', async ({ organizerApi }) => {
    // Logging out only clears the refresh cookie server-side and does not
    // invalidate the bearer access token already held by the fixture, so this
    // does not affect other organizer-scoped tests in the suite.
    const resp = await organizerApi.post('/auth/logout');
    expect(resp.status()).toBe(204);
  });
});
