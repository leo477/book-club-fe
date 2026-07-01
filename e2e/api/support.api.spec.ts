import { test, expect } from '../fixtures/api-context.fixture';

test.describe('support API', () => {
  test('POST /support — 201 for any authenticated user, 401 anonymously', async ({ memberApi, anonApi }) => {
    const resp = await memberApi.post('/support', {
      data: { type: 'suggestion', title: 'PW Audit suggestion', body: 'Seeded by Playwright full-audit.' },
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body).toHaveProperty('id');

    const anonResp = await anonApi.post('/support', {
      data: { type: 'comment', title: 'Anon', body: 'Should be rejected' },
    });
    expect(anonResp.status()).toBe(401);
  });

  test('POST /support — 422 on an invalid type', async ({ memberApi }) => {
    const resp = await memberApi.post('/support', { data: { type: 'not-a-type', title: 'x', body: 'x' } });
    expect(resp.status()).toBe(422);
  });

  test('GET /support — 200 for any authenticated user', async ({ memberApi }) => {
    const resp = await memberApi.get('/support');
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  // PATCH /{submission_id}/status requires app.dependencies.require_admin, not
  // organizer — since this suite only seeds member/organizer personas (no admin),
  // both are expected to be forbidden here rather than the usual member=403/organizer=200 pattern.
  test('PATCH /support/{submission_id}/status — 403 for both member and organizer (admin-only)', async ({
    memberApi,
    organizerApi,
  }) => {
    const randomId = '00000000-0000-4000-8000-000000000000';
    const memberResp = await memberApi.patch(`/support/${randomId}/status`, { data: { status: 'done' } });
    expect(memberResp.status()).toBe(403);

    const organizerResp = await organizerApi.patch(`/support/${randomId}/status`, { data: { status: 'done' } });
    expect(organizerResp.status()).toBe(403);
  });
});
