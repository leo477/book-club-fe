import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';
import { apiContextFor } from '../fixtures/seed-helper';
import { apiBaseURL } from '../../playwright.full-audit.config';

// wsUrl in src/environments/environment.ts is always apiUrl with the scheme
// swapped http(s)->ws(s), same /api/v1 path — mirror that here rather than
// hardcoding a second base URL.
const wsBaseURL = apiBaseURL.replace(/^http/, 'ws');

test.describe('chat API — rooms (organizer-only creation/deletion/ban)', () => {
  test('GET /clubs/{club_id}/chat/rooms — 200 list', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/clubs/${runContext.clubId}/chat/rooms`);
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  test('POST /clubs/{club_id}/chat/rooms — 403 for a member, 201 for the organizer', async ({
    memberApi,
    organizerApi,
  }) => {
    const runContext = loadRunContext();
    const memberResp = await memberApi.post(`/clubs/${runContext.clubId}/chat/rooms`, {
      data: { name: `member-room-${Date.now()}` },
    });
    expect(memberResp.status()).toBe(403);

    const organizerResp = await organizerApi.post(`/clubs/${runContext.clubId}/chat/rooms`, {
      data: { name: `pw-audit-room-${Date.now()}` },
    });
    expect(organizerResp.status()).toBe(201);
    const room = await organizerResp.json();
    expect(room).toHaveProperty('id');
  });
});

test.describe('chat API — messages, ban, read tracking on a throwaway room', () => {
  test('send/list/delete messages, ban a bogus user, read tracking, then delete the room', async ({
    organizerApi,
    memberApi,
  }) => {
    const runContext = loadRunContext();
    const roomResp = await organizerApi.post(`/clubs/${runContext.clubId}/chat/rooms`, {
      data: { name: `pw-audit-msgs-${Date.now()}` },
    });
    expect(roomResp.status()).toBe(201);
    const room = await roomResp.json();

    const sendResp = await memberApi.post(`/chat/rooms/${room.id}/messages`, { data: { text: 'Hello from PW audit' } });
    expect(sendResp.status()).toBe(201);
    const message = await sendResp.json();

    const listResp = await memberApi.get(`/chat/rooms/${room.id}/messages`);
    expect(listResp.status()).toBe(200);
    const messages = await listResp.json();
    expect(messages.some((m: { id: string }) => m.id === message.id)).toBe(true);

    const unreadResp = await memberApi.get(`/chat/rooms/${room.id}/unread-count`);
    expect(unreadResp.status()).toBe(200);

    const readResp = await memberApi.post(`/chat/rooms/${room.id}/read`, {
      data: { last_read_message_id: message.id },
    });
    expect(readResp.status()).toBe(204);

    const memberBan = await memberApi.post(`/chat/rooms/${room.id}/ban`, {
      data: { user_id: runContext.organizer.userId, duration_seconds: 60 },
    });
    expect(memberBan.status()).toBe(403);

    const organizerBan = await organizerApi.post(`/chat/rooms/${room.id}/ban`, {
      data: { user_id: '00000000-0000-4000-8000-000000000000', duration_seconds: 60 },
    });
    expect(organizerBan.status()).toBe(204);

    const deleteMsgResp = await memberApi.delete(`/chat/rooms/${room.id}/messages/${message.id}`);
    expect([200, 204]).toContain(deleteMsgResp.status());

    const memberDeleteRoom = await memberApi.delete(`/chat/rooms/${room.id}`);
    expect(memberDeleteRoom.status()).toBe(403);

    const deleteRoomResp = await organizerApi.delete(`/chat/rooms/${room.id}`);
    expect(deleteRoomResp.status()).toBe(204);
  });
});

test.describe('chat API — event chat room', () => {
  test('POST/GET /events/{event_id}/chat/room — organizer-only creation', async ({ memberApi, organizerApi }) => {
    const runContext = loadRunContext();
    const memberResp = await memberApi.post(`/events/${runContext.eventId}/chat/room`);
    expect(memberResp.status()).toBe(403);

    const organizerResp = await organizerApi.post(`/events/${runContext.eventId}/chat/room`);
    expect(organizerResp.status()).toBe(201);

    const getResp = await organizerApi.get(`/events/${runContext.eventId}/chat/room`);
    expect(getResp.status()).toBe(200);
  });
});

test.describe('chat WebSocket', () => {
  // No `ws` npm package is actually installed (package.json only lists it under
  // `overrides` — a transitive-dependency version pin, not a real dependency),
  // and the plan says not to add a new dependency without asking. Using the
  // browser's native WebSocket via page.evaluate avoids that entirely — it's
  // the other option the plan called out, and Playwright's `page` fixture is
  // already available for free since api-context.fixture.ts only adds fixtures
  // on top of the base `@playwright/test` test.
  test('connecting and sending the {type:"auth"} frame is accepted, not closed with 1008', async ({ page }) => {
    const runContext = loadRunContext();
    const organizerApi = await apiContextFor('organizer');
    const room = await (
      await organizerApi.post(`/clubs/${runContext.clubId}/chat/rooms`, { data: { name: `pw-audit-ws-${Date.now()}` } })
    ).json();
    await organizerApi.dispose();

    const result = await page.evaluate(
      ([wsUrl, token]) =>
        new Promise<{ ok: boolean; detail: string }>((resolve) => {
          const socket = new WebSocket(wsUrl);
          const timer = setTimeout(
            () => resolve({ ok: false, detail: 'timed out waiting for a server message' }),
            10_000,
          );
          socket.addEventListener('open', () => {
            socket.send(JSON.stringify({ type: 'auth', token }));
          });
          socket.addEventListener('message', (event) => {
            clearTimeout(timer);
            resolve({ ok: true, detail: String(event.data) });
          });
          socket.addEventListener('close', (event) => {
            clearTimeout(timer);
            resolve({ ok: false, detail: `closed with code ${event.code} before sending a message` });
          });
          socket.addEventListener('error', () => {
            clearTimeout(timer);
            resolve({ ok: false, detail: 'WebSocket error' });
          });
        }),
      [`${wsBaseURL}/chat/rooms/${room.id}`, runContext.member.accessToken] as const,
    );

    expect(result.ok, result.detail).toBe(true);
  });
});
