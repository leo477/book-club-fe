import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createChatSocket } from '@book-club/api-client/ws';
import { API, server, setupApiServer } from '@/test/harness';
import { fetchWsTicket } from './chat-ticket';
import { FakeWebSocket, sockets } from './test-support';

const nav = vi.hoisted(() => ({ hard: vi.fn() }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));

setupApiServer();
beforeEach(() => {
  nav.hard.mockReset();
  FakeWebSocket.reset();
  vi.stubGlobal('WebSocket', FakeWebSocket);
});

type Reply = 'ok' | 401 | 403 | 'network';
function mockTicket(replies: Reply[], me: 'ok' | 401 = 'ok') {
  const hits = { ticket: 0, me: 0, refresh: 0 };
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.post(`${API}/auth/ws-ticket`, () => {
      const reply = replies[Math.min(hits.ticket, replies.length - 1)] ?? 'ok';
      hits.ticket += 1;
      if (reply === 'network') return HttpResponse.error();
      if (reply === 'ok') return HttpResponse.json({ ticket: `ticket-${hits.ticket}` });
      return HttpResponse.json({ detail: 'nope' }, { status: reply });
    }),
    http.get(`${API}/auth/me`, () => {
      hits.me += 1;
      return me === 'ok' ? HttpResponse.json({ id: 'u1', email: 'u@example.com', displayName: 'A', role: 'user', createdAt: '2024-01-01T00:00:00Z', socialsPublic: false, socials: {} }) : HttpResponse.json({ detail: 'expired' }, { status: 401 });
    }),
    http.post(`${API}/auth/refresh`, () => {
      hits.refresh += 1;
      return HttpResponse.json({ detail: 'expired' }, { status: 401 });
    }),
  );
  return hits;
}

const until = async (check: () => boolean, ms = 3_000) => {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 5));
  }
};

describe('fetchWsTicket', () => {
  it('returns the ticket straight away when the session is fine', async () => {
    const hits = mockTicket(['ok']);
    await expect(fetchWsTicket()).resolves.toBe('ticket-1');
    expect(hits).toMatchObject({ ticket: 1, me: 0 });
  });

  it('on a 401 checks the session once through /auth/me and retries the ticket once', async () => {
    const hits = mockTicket([401, 'ok']);
    await expect(fetchWsTicket()).resolves.toBe('ticket-2');
    expect(hits).toMatchObject({ ticket: 2, me: 1 });
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('on a 401 with a dead session gives no ticket (the api client signs out), and no socket is opened', async () => {
    const hits = mockTicket([401], 401);
    await expect(fetchWsTicket()).resolves.toBeNull();
    expect(hits.ticket).toBe(1);
    expect(hits.me).toBe(1);

    const socket = createChatSocket({ baseUrl: 'wss://x.test/api/v1', roomId: 'r1', getTicket: fetchWsTicket, baseDelayMs: 5, maxDelayMs: 10 });
    await until(() => socket.status === 'closed');
    expect(FakeWebSocket.instances).toHaveLength(0);
    socket.close();
  });

  it('on a 403 stops at once: one call, no retry, no /auth/me, no navigation', async () => {
    const hits = mockTicket([403]);
    await expect(fetchWsTicket()).resolves.toBeNull();
    expect(hits).toMatchObject({ ticket: 1, me: 0, refresh: 0 });
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('a network error is not "no session": it rejects, and the socket keeps retrying until the ticket arrives', async () => {
    const hits = mockTicket(['network', 'network', 'ok']);
    await expect(fetchWsTicket()).rejects.toMatchObject({ status: 0 });

    const socket = createChatSocket({ baseUrl: 'wss://x.test/api/v1', roomId: 'r1', getTicket: fetchWsTicket, baseDelayMs: 5, maxDelayMs: 10 });
    await until(() => sockets().length === 1);
    expect(hits.ticket).toBe(3);
    expect(socket.status).not.toBe('closed');
    socket.close();
  });
});
