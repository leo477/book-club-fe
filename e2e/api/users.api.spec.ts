import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';

// No role gating anywhere in app/routers/users.py — every endpoint just needs
// an authenticated caller acting on their own profile.

test.describe('users API', () => {
  test('GET /users/me — 200', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get('/users/me');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('id', runContext.member.userId);
  });

  test('GET /users/me — 401 without a token', async ({ anonApi }) => {
    const resp = await anonApi.get('/users/me');
    expect(resp.status()).toBe(401);
  });

  test('GET /users/me/stats — 200', async ({ memberApi }) => {
    const resp = await memberApi.get('/users/me/stats');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('clubsJoined');
  });

  test('PATCH /users/me — 200 updates display name', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.patch('/users/me', { data: { displayName: `PW Audit Member ${runContext.runId}` } });
    expect(resp.status()).toBe(200);
  });

  test('PATCH /users/me/role — 200 round-trips organizer role', async ({ organizerApi }) => {
    // Round-trips back to "organizer" so the rest of the suite (which relies
    // on this persona actually being an organizer) is unaffected.
    const toMember = await organizerApi.patch('/users/me/role', { data: { role: 'user' } });
    expect(toMember.status()).toBe(200);
    const backToOrganizer = await organizerApi.patch('/users/me/role', { data: { role: 'organizer' } });
    expect(backToOrganizer.status()).toBe(200);
    const body = await backToOrganizer.json();
    expect(body).toHaveProperty('role', 'organizer');
  });

  test('PATCH /users/me/socials — 200', async ({ memberApi }) => {
    const resp = await memberApi.patch('/users/me/socials', { data: { telegram: '@pw_audit' } });
    expect(resp.status()).toBe(200);
  });

  test('PATCH /users/me/socials-visibility — 200', async ({ memberApi }) => {
    const resp = await memberApi.patch('/users/me/socials-visibility', { data: { socialsPublic: true } });
    expect(resp.status()).toBe(200);
  });
});
