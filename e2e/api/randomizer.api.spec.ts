import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';

// Not organizer-gated at the router level (app/routers/randomizer.py) — any
// authenticated club member can spin the randomizer.

test.describe('randomizer API', () => {
  test('GET .../randomizer/history — 200 list', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/clubs/${runContext.clubId}/randomizer/history`);
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  test('POST .../randomizer/sessions — 201, then shows up in history', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const candidate = { userId: runContext.member.userId, displayName: 'PW Audit Member' };
    const resp = await memberApi.post(`/clubs/${runContext.clubId}/randomizer/sessions`, {
      data: { purpose: 'next-book', candidates: [candidate], result: candidate },
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body).toHaveProperty('id');

    const historyResp = await memberApi.get(`/clubs/${runContext.clubId}/randomizer/history`);
    const history = await historyResp.json();
    expect(history.some((s: { id: string }) => s.id === body.id)).toBe(true);
  });

  test('POST .../randomizer/sessions — 401 without a token', async ({ anonApi }) => {
    const runContext = loadRunContext();
    const resp = await anonApi.post(`/clubs/${runContext.clubId}/randomizer/sessions`, {
      data: { purpose: 'next-book', candidates: [] },
    });
    expect(resp.status()).toBe(401);
  });
});
