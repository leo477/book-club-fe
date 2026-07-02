import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';
import { createClub, registerDisposableOrganizer } from '../fixtures/seed-helper';

// Read-only / non-destructive checks reuse the shared seeded club
// (runContext.clubId). Anything that mutates or deletes club state creates
// its own throwaway club first, so other spec files' assumptions about the
// shared fixture stay intact.

test.describe('clubs API — reads on the shared seeded club', () => {
  test('GET /clubs — 200 list', async ({ memberApi }) => {
    const resp = await memberApi.get('/clubs');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /clubs/my — 200 for the organizer', async ({ organizerApi }) => {
    const runContext = loadRunContext();
    const resp = await organizerApi.get('/clubs/my');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.some((c: { id: string }) => c.id === runContext.clubId)).toBe(true);
  });

  test('GET /clubs/{club_id} — 200', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/clubs/${runContext.clubId}`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('id', runContext.clubId);
  });

  test('GET /clubs/{club_id}/events — 200', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/clubs/${runContext.clubId}/events`);
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  test('GET /clubs/{club_id}/stats — 200 for the organizer', async ({ organizerApi }) => {
    const runContext = loadRunContext();
    const resp = await organizerApi.get(`/clubs/${runContext.clubId}/stats`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('totalMembers');
  });
});

test.describe('clubs API — role enforcement on the shared seeded club (non-destructive)', () => {
  test('PATCH /clubs/{club_id} — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.patch(`/clubs/${runContext.clubId}`, { data: { description: 'hacked' } });
    expect(resp.status()).toBe(403);
  });

  test('PATCH /clubs/{club_id} — 200 for the organizer (no-op update)', async ({ organizerApi }) => {
    const runContext = loadRunContext();
    const resp = await organizerApi.patch(`/clubs/${runContext.clubId}`, {
      data: { description: 'Seeded by Playwright full-audit global setup' },
    });
    expect(resp.status()).toBe(200);
  });

  test('POST /clubs/{club_id}/events — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.post(`/clubs/${runContext.clubId}/events`, {
      data: { title: 'Member Attempt', date: new Date(Date.now() + 86_400_000).toISOString(), city: 'Kyiv' },
    });
    expect(resp.status()).toBe(403);
  });
});

test.describe('clubs API — mutating flows on a throwaway club', () => {
  // The backend enforces one club per organizer (ORGANIZER_ALREADY_HAS_CLUB,
  // 409) and the shared `organizer` persona already owns the seeded baseline
  // club, so every test here that creates a club registers its own disposable
  // organizer rather than reusing the `organizerApi` fixture.

  test('POST /clubs — 201 creates a club as organizer, 422 on invalid body', async ({ anonApi }) => {
    const organizerApi = await registerDisposableOrganizer();
    const resp = await organizerApi.post('/clubs', { data: { name: `Throwaway Club ${Date.now()}` } });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body).toHaveProperty('id');

    const badResp = await organizerApi.post('/clubs', { data: { name: '' } });
    expect(badResp.status()).toBe(422);

    const anonResp = await anonApi.post('/clubs', { data: { name: 'Anon Club' } });
    expect(anonResp.status()).toBe(401);
    await organizerApi.dispose();
  });

  test('PATCH .../pause, .../cancel, .../reschedule — organizer only, DELETE removes the club', async ({
    memberApi,
  }) => {
    const organizerApi = await registerDisposableOrganizer();
    const club = await createClub(organizerApi, { name: `Lifecycle Club ${Date.now()}` });

    const memberPause = await memberApi.patch(`/clubs/${club.id}/pause`);
    expect(memberPause.status()).toBe(403);

    const pauseResp = await organizerApi.patch(`/clubs/${club.id}/pause`);
    expect(pauseResp.status()).toBe(200);

    const rescheduleResp = await organizerApi.patch(`/clubs/${club.id}/reschedule`, {
      data: { newDate: new Date(Date.now() + 7 * 86_400_000).toISOString() },
    });
    expect(rescheduleResp.status()).toBe(200);

    const cancelResp = await organizerApi.patch(`/clubs/${club.id}/cancel`);
    expect(cancelResp.status()).toBe(200);

    const memberDelete = await memberApi.delete(`/clubs/${club.id}`);
    expect(memberDelete.status()).toBe(403);

    const deleteResp = await organizerApi.delete(`/clubs/${club.id}`);
    expect(deleteResp.status()).toBe(204);
    await organizerApi.dispose();
  });

  test('POST .../join and DELETE .../leave', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const organizerApi = await registerDisposableOrganizer();
    const club = await createClub(organizerApi, { name: `Join Club ${Date.now()}`, isPublic: true });

    // Joining always creates a *pending* join request, even for a public
    // club (app/services/club_service.py's request_join_club_service — no
    // auto-approval path exists) — DELETE /leave 409s on a request that was
    // never approved into an actual club_members row, so approve it first.
    const joinResp = await memberApi.post(`/clubs/${club.id}/join`);
    expect([200, 201, 204]).toContain(joinResp.status());

    const approveResp = await organizerApi.post(`/clubs/${club.id}/join-requests/${runContext.member.userId}/approve`);
    expect(approveResp.status()).toBe(200);

    const leaveResp = await memberApi.delete(`/clubs/${club.id}/leave`);
    expect(leaveResp.status()).toBe(204);
    await organizerApi.dispose();
  });
});
