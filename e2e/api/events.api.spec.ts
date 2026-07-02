import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';
import { createEvent } from '../fixtures/seed-helper';

test.describe('events API — reads on the shared seeded event', () => {
  test('GET /events — 200 list', async ({ memberApi }) => {
    const resp = await memberApi.get('/events');
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  test('GET /events/my — 200 for the organizer', async ({ organizerApi }) => {
    const resp = await organizerApi.get('/events/my');
    expect(resp.status()).toBe(200);
  });

  test('GET /events/{event_id} — 200, works anonymously too', async ({ memberApi, anonApi }) => {
    const runContext = loadRunContext();
    const memberResp = await memberApi.get(`/events/${runContext.eventId}`);
    expect(memberResp.status()).toBe(200);
    const body = await memberResp.json();
    expect(body).toHaveProperty('id', runContext.eventId);

    const anonResp = await anonApi.get(`/events/${runContext.eventId}`);
    expect(anonResp.status()).toBe(200);
  });
});

test.describe('events API — role enforcement', () => {
  test('PATCH /events/{event_id} — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.patch(`/events/${runContext.eventId}`, { data: { title: 'Hacked' } });
    expect(resp.status()).toBe(403);
  });

  test('PATCH /events/{event_id}/reschedule and /winner — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const rescheduleResp = await memberApi.patch(`/events/${runContext.eventId}/reschedule`, {
      data: { newDate: new Date(Date.now() + 3 * 86_400_000).toISOString() },
    });
    expect(rescheduleResp.status()).toBe(403);

    const winnerResp = await memberApi.patch(`/events/${runContext.eventId}/winner`, {
      data: { winner_id: runContext.member.userId },
    });
    expect(winnerResp.status()).toBe(403);
  });
});

test.describe('events API — attendance', () => {
  test('POST /events/{event_id}/attend then DELETE — member attends and un-attends', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const attendResp = await memberApi.post(`/events/${runContext.eventId}/attend`);
    expect(attendResp.status()).toBe(201);

    const cancelResp = await memberApi.delete(`/events/${runContext.eventId}/attend`);
    expect(cancelResp.status()).toBe(204);
  });
});

test.describe('events API — mutating flows on a throwaway event', () => {
  test('PATCH .../cancel — organizer only, 200 on a disposable event', async ({ organizerApi, memberApi }) => {
    const runContext = loadRunContext();
    const event = await createEvent(organizerApi, runContext.clubId, {
      title: `Throwaway Event ${Date.now()}`,
      date: new Date(Date.now() + 5 * 86_400_000).toISOString(),
      city: 'Kyiv',
    });

    const memberCancel = await memberApi.patch(`/events/${event.id}/cancel`);
    expect(memberCancel.status()).toBe(403);

    const organizerCancel = await organizerApi.patch(`/events/${event.id}/cancel`);
    expect(organizerCancel.status()).toBe(200);
  });

  test('PATCH /events/{event_id} — 200 for the organizer on a disposable event', async ({ organizerApi }) => {
    const runContext = loadRunContext();
    const event = await createEvent(organizerApi, runContext.clubId, {
      title: `Edit Target ${Date.now()}`,
      date: new Date(Date.now() + 5 * 86_400_000).toISOString(),
      city: 'Kyiv',
    });

    const resp = await organizerApi.patch(`/events/${event.id}`, { data: { title: 'Edited Title' } });
    expect(resp.status()).toBe(200);
  });
});
