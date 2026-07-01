import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';

// All endpoints here are mounted under /clubs/{club_id}/... (app/routers/members.py).
// Every mutating endpoint is organizer-only; ban/unban/role-change are exercised
// against a random nonexistent user id rather than the shared seeded member, so a
// passing organizer-positive case proves the auth guard let the organizer through
// (404 not 403) without actually banning/demoting the real shared membership that
// other spec files (clubs, events, quizzes) depend on.
const RANDOM_UUID = '00000000-0000-4000-8000-000000000000';

test.describe('members API', () => {
  test('GET /clubs/{club_id}/members — 200, includes the seeded member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/clubs/${runContext.clubId}/members`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.some((m: { userId: string }) => m.userId === runContext.member.userId)).toBe(true);
  });

  test('GET /clubs/{club_id}/my-membership — 200 for the member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/clubs/${runContext.clubId}/my-membership`);
    expect(resp.status()).toBe(200);
  });

  test('DELETE /clubs/{club_id}/members/{user_id} — 403 for a member, 404 for the organizer on a bogus id', async ({
    memberApi,
    organizerApi,
  }) => {
    const runContext = loadRunContext();
    const memberResp = await memberApi.delete(`/clubs/${runContext.clubId}/members/${RANDOM_UUID}`);
    expect(memberResp.status()).toBe(403);

    const organizerResp = await organizerApi.delete(`/clubs/${runContext.clubId}/members/${RANDOM_UUID}`);
    expect(organizerResp.status()).toBe(404);
  });

  test('POST .../ban and DELETE .../bans/{user_id} — 403 for a member, 404 for the organizer on a bogus id', async ({
    memberApi,
    organizerApi,
  }) => {
    const runContext = loadRunContext();
    const memberBan = await memberApi.post(`/clubs/${runContext.clubId}/members/${RANDOM_UUID}/ban`, {
      data: { duration: 1 },
    });
    expect(memberBan.status()).toBe(403);

    const organizerBan = await organizerApi.post(`/clubs/${runContext.clubId}/members/${RANDOM_UUID}/ban`, {
      data: { duration: 1 },
    });
    expect(organizerBan.status()).toBe(404);

    const organizerUnban = await organizerApi.delete(`/clubs/${runContext.clubId}/bans/${RANDOM_UUID}`);
    expect(organizerUnban.status()).toBe(404);
  });

  test('PATCH .../members/{user_id}/role — 403 for a member, 404 for the organizer on a bogus id', async ({
    memberApi,
    organizerApi,
  }) => {
    const runContext = loadRunContext();
    const memberResp = await memberApi.patch(`/clubs/${runContext.clubId}/members/${RANDOM_UUID}/role`, {
      data: { role: 'organizer' },
    });
    expect(memberResp.status()).toBe(403);

    const organizerResp = await organizerApi.patch(`/clubs/${runContext.clubId}/members/${RANDOM_UUID}/role`, {
      data: { role: 'organizer' },
    });
    expect(organizerResp.status()).toBe(404);
  });

  test('GET .../bans — 200 for the organizer, 403 for a member', async ({ memberApi, organizerApi }) => {
    const runContext = loadRunContext();
    const organizerResp = await organizerApi.get(`/clubs/${runContext.clubId}/bans`);
    expect(organizerResp.status()).toBe(200);

    const memberResp = await memberApi.get(`/clubs/${runContext.clubId}/bans`);
    expect(memberResp.status()).toBe(403);
  });

  test('GET .../join-requests — 200 for the organizer, 403 for a member', async ({ memberApi, organizerApi }) => {
    const runContext = loadRunContext();
    const organizerResp = await organizerApi.get(`/clubs/${runContext.clubId}/join-requests`);
    expect(organizerResp.status()).toBe(200);

    const memberResp = await memberApi.get(`/clubs/${runContext.clubId}/join-requests`);
    expect(memberResp.status()).toBe(403);
  });

  test('POST .../join-requests/{user_id}/approve and /reject — organizer only', async ({
    memberApi,
    organizerApi,
  }) => {
    const runContext = loadRunContext();
    const memberApprove = await memberApi.post(
      `/clubs/${runContext.clubId}/join-requests/${RANDOM_UUID}/approve`,
    );
    expect(memberApprove.status()).toBe(403);

    const organizerReject = await organizerApi.post(
      `/clubs/${runContext.clubId}/join-requests/${RANDOM_UUID}/reject`,
    );
    // No pending join-request exists for this bogus user id — 404 still proves
    // the organizer passed the auth guard.
    expect(organizerReject.status()).toBe(404);
  });
});
