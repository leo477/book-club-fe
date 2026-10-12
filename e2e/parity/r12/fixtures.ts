// Deterministic REST + WebSocket mock for the R12 (chat) parity specs. No backend, no credential.
//
// REST (page.route on **/api/v1/**): /auth/*, /clubs/my (optionally held for N ms), /clubs/:id/chat/rooms, /chat/rooms/:id/messages
// (GET with before_id|before paging, POST send), /unread-count, /read, /auth/ws-ticket. Everything else falls through to the R6
// handler. The chat socket (Next: NEXT_PUBLIC_WS_URL host, Angular: wss://book-club-be.onrender.com) is mocked with
// page.routeWebSocket on the path `/chat/rooms/:id`, so both targets are served by the same code.
//
// The mock keeps bookkeeping the specs assert on: every ticket handed out, every socket that was opened (room, ticket it
// authenticated with, open/closed, close code) and every REST call.
import type { Page, WebSocketRoute } from '@playwright/test';
import { handleApi, IDS, MEMBER_ID, newState, ORGANIZER_ID, CLUBS } from '../r6/fixtures';

export const CLUB = IDS.public;
export const ROOM_A = 'c1000000-0000-4000-8000-000000000001';
export const ROOM_B = 'c1000000-0000-4000-8000-000000000002';
export const OTHER_ID = 'user-other';
export const OTHER_NAME = 'Іван Співрозмовник';
export const ME_NAME = 'Максим Учасник';

export interface Msg {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem: boolean;
}
export type Viewer = 'guest' | 'member';
/** how the fake server answers the next socket(s): ok = presence snapshot after auth; refuse = close before answering the auth frame; kick = answer, then 1008 */
export type WsMode = 'ok' | 'refuse' | 'kick';

export interface MockSocket {
  n: number;
  roomId: string;
  url: string;
  ticket: string | null;
  authed: boolean;
  closed: boolean;
  closeCode: number | null;
  route: WebSocketRoute;
}

export interface ChatMock {
  viewer: Viewer;
  rooms: { id: string; name: string }[];
  messages: Record<string, Msg[]>;
  unread: Record<string, { count: number; last: string | null }>;
  log: { method: string; path: string; query: string; body: string | null; at: number }[];
  tickets: string[];
  sockets: MockSocket[];
  wsMode: WsMode;
  /** forced status per generic key, e.g. `POST /auth/ws-ticket` */
  fail: Record<string, number>;
  /** after a POST /messages: push the echo on the room socket (default true), after this many ms */
  echo: boolean;
  echoDelayMs: number;
  noClubs: boolean;
  hits: Record<string, number>;
  nextId: number;
  open(roomId?: string): MockSocket[];
  /** server pushes a message frame to every open, authenticated socket of the room */
  push(roomId: string, msg: Partial<Msg> & { text: string }): Msg;
  frame(roomId: string, frame: unknown): void;
  /** server drops every open socket (no 1000 close): an abrupt loss */
  drop(code?: number): void;
  calls(method: string, path: string | RegExp): ChatMock['log'];
  clear(): void;
}

const iso = (min: number) => new Date(Date.UTC(2026, 9, 12, 10, 0, 0) + min * 60_000).toISOString();
const mid = (n: number) => `d0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** `n` messages, oldest first, alternating senders; ids ascend with time so before_id paging is well defined */
export function history(roomId: string, n: number, startAt = 1): Msg[] {
  const base = roomId === ROOM_A ? 0 : 5000;
  return Array.from({ length: n }, (_, i) => {
    const k = startAt + i;
    const mine = k % 3 === 0;
    return {
      id: mid(base + k),
      senderId: mine ? MEMBER_ID : OTHER_ID,
      senderName: mine ? ME_NAME : OTHER_NAME,
      text: `Повідомлення ${roomId === ROOM_A ? 'A' : 'B'}-${k}`,
      timestamp: iso(k),
      isSystem: false,
    };
  });
}

const user = (viewer: Viewer) => ({
  id: MEMBER_ID,
  email: 'mock@example.test',
  displayName: ME_NAME,
  role: 'user',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
  socialsPublic: false,
  socials: {},
  _v: viewer,
});

export interface ChatOpts {
  rooms?: { id: string; name: string }[];
  messages?: Record<string, Msg[]>;
  unread?: Record<string, { count: number; last: string | null }>;
  wsMode?: WsMode;
  fail?: Record<string, number>;
  /** hold GET /clubs/my this long */
  myClubsDelayMs?: number;
  echo?: boolean;
  echoDelayMs?: number;
  /** viewer has no club */
  noClubs?: boolean;
}

export async function installChatMock(page: Page, viewer: Viewer, opts: ChatOpts = {}): Promise<ChatMock> {
  const rooms = opts.rooms ?? [
    { id: ROOM_A, name: 'Загальна' },
    { id: ROOM_B, name: 'Книги' },
  ];
  const mock: ChatMock = {
    viewer,
    rooms,
    messages: opts.messages ?? { [ROOM_A]: history(ROOM_A, 6), [ROOM_B]: history(ROOM_B, 3) },
    unread: opts.unread ?? { [ROOM_A]: { count: 0, last: null }, [ROOM_B]: { count: 0, last: null } },
    log: [],
    tickets: [],
    sockets: [],
    wsMode: opts.wsMode ?? 'ok',
    fail: opts.fail ?? {},
    echo: opts.echo ?? true,
    echoDelayMs: opts.echoDelayMs ?? 0,
    noClubs: opts.noClubs ?? false,
    hits: {},
    nextId: 100,
    open: (roomId) => mock.sockets.filter((s) => !s.closed && (!roomId || s.roomId === roomId)),
    push(roomId, partial) {
      const list = (mock.messages[roomId] ??= []);
      const msg: Msg = {
        id: mid((roomId === ROOM_A ? 0 : 5000) + 800 + mock.nextId++),
        senderId: OTHER_ID,
        senderName: OTHER_NAME,
        timestamp: iso(100 + list.length),
        isSystem: false,
        ...partial,
      };
      list.push(msg);
      mock.frame(roomId, { type: 'message', payload: msg });
      return msg;
    },
    frame(roomId, frame) {
      for (const s of mock.open(roomId)) if (s.authed) s.route.send(JSON.stringify(frame));
    },
    drop(code = 1011) {
      for (const s of mock.open()) {
        s.closed = true;
        s.closeCode = code;
        s.route.close({ code });
      }
    },
    calls: (method, path) => mock.log.filter((r) => r.method === method && (typeof path === 'string' ? r.path === path : path.test(r.path))),
    clear: () => {
      mock.log.length = 0;
    },
  };

  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    const body = req.postData();
    mock.log.push({ method: req.method(), path, query: url.search, body, at: Date.now() });
    const generic = `${req.method()} ${path.replace(/[0-9a-f-]{36}/g, ':id')}`;
    mock.hits[generic] = (mock.hits[generic] ?? 0) + 1;
    if (generic === 'GET /clubs/my' && opts.myClubsDelayMs) await new Promise((r) => setTimeout(r, opts.myClubsDelayMs));
    const reply = handle(mock, req.method(), path, url.searchParams, body, generic) ?? handleApi(newState(viewer === 'guest' ? 'guest' : 'member'), req.method(), path, url.search, body);
    await route.fulfill({ status: reply.status, contentType: 'application/json', body: reply.body === undefined ? '' : JSON.stringify(reply.body) });
  });

  // the chat socket only; Next dev's HMR socket (/_next/webpack-hmr) is left alone
  await page.routeWebSocket(/\/chat\/rooms\/[^/?]+$/, (ws) => {
    const url = ws.url();
    const sock: MockSocket = { n: mock.sockets.length + 1, roomId: decodeURIComponent(url.split('/').pop()!), url, ticket: null, authed: false, closed: false, closeCode: null, route: ws };
    mock.sockets.push(sock);
    ws.onClose((code) => {
      sock.closed = true;
      sock.closeCode ??= code ?? 1005;
    });
    ws.onMessage((raw) => {
      let frame: { type?: string; ticket?: string } = {};
      try {
        frame = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (frame.type !== 'auth') return;
      sock.ticket = frame.ticket ?? null;
      if (mock.wsMode === 'refuse') {
        sock.closed = true;
        sock.closeCode = 1011;
        ws.close({ code: 1011 });
        return;
      }
      sock.authed = true;
      ws.send(JSON.stringify({ type: 'presence_snapshot', payload: [{ userId: OTHER_ID, status: 'online' }, { userId: MEMBER_ID, status: 'online' }] }));
      if (mock.wsMode === 'kick') {
        setTimeout(() => {
          sock.closed = true;
          sock.closeCode = 1008;
          ws.close({ code: 1008, reason: 'removed' });
        }, 50);
      }
    });
  });
  return mock;
}

type Reply = { status: number; body?: unknown };

function handle(m: ChatMock, method: string, path: string, q: URLSearchParams, raw: string | null, generic: string): Reply | null {
  const authed = m.viewer !== 'guest';
  const forced = m.fail[generic];
  if (forced) return { status: forced, body: { detail: 'forced failure' } };
  const json = (): Record<string, unknown> => {
    try {
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  };
  let r: RegExpMatchArray | null;
  if (method === 'GET' && path === '/auth/me') return authed ? { status: 200, body: user(m.viewer) } : { status: 401, body: { detail: 'no' } };
  if (method === 'POST' && path === '/auth/refresh') return authed ? { status: 200, body: { accessToken: 'mock', refreshToken: 'mock', user: user(m.viewer) } } : { status: 401, body: { detail: 'no' } };
  if (method === 'GET' && path === '/auth/session-status') return { status: 200, body: { hasSession: authed } };
  if (method === 'POST' && path === '/auth/logout') {
    m.viewer = 'guest';
    return { status: 204 };
  }
  if (method === 'POST' && path === '/auth/ws-ticket') {
    if (!authed) return { status: 401, body: { detail: 'no' } };
    const ticket = `ticket-${m.tickets.length + 1}`;
    m.tickets.push(ticket);
    return { status: 200, body: { ticket } };
  }
  if (method === 'GET' && path === '/clubs/my') {
    if (!authed) return { status: 401, body: { detail: 'no' } };
    return { status: 200, body: m.noClubs ? [] : [{ ...CLUBS[CLUB], organizerId: ORGANIZER_ID }] };
  }
  if ((r = path.match(/^\/clubs\/[0-9a-f-]{36}\/chat\/rooms$/)) && method === 'GET') return authed ? { status: 200, body: m.rooms.map((x) => ({ ...x, eventId: null })) } : { status: 401, body: { detail: 'no' } };
  if ((r = path.match(/^\/chat\/rooms\/([^/]+)\/messages$/))) {
    const id = r[1]!;
    const list = m.messages[id] ?? [];
    if (method === 'GET') {
      const before = q.get('before_id') ?? q.get('before');
      const limit = Number(q.get('limit') ?? 50);
      const end = before ? list.findIndex((x) => x.id === before) : list.length;
      const page = list.slice(Math.max(0, (end < 0 ? list.length : end) - limit), end < 0 ? list.length : end);
      return { status: 200, body: page };
    }
    if (method === 'POST') {
      const text = String(json()['text'] ?? '');
      const msg: Msg = { id: mid((id === ROOM_A ? 0 : 5000) + 900 + m.nextId++), senderId: MEMBER_ID, senderName: ME_NAME, text, timestamp: iso(200 + list.length), isSystem: false };
      list.push(msg);
      m.messages[id] = list;
      if (m.echo) setTimeout(() => m.frame(id, { type: 'message', payload: msg }), m.echoDelayMs);
      return { status: 201, body: msg };
    }
  }
  if ((r = path.match(/^\/chat\/rooms\/([^/]+)\/unread-count$/)) && method === 'GET') {
    const u = m.unread[r[1]!] ?? { count: 0, last: null };
    return { status: 200, body: { room_id: r[1], unread_count: u.count, last_read_message_id: u.last } };
  }
  if ((r = path.match(/^\/chat\/rooms\/([^/]+)\/read$/)) && method === 'POST') {
    m.unread[r[1]!] = { count: 0, last: String(json()['last_read_message_id'] ?? '') || null };
    return { status: 204 };
  }
  return null;
}
