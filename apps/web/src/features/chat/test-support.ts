import { HttpResponse, http } from 'msw';
import { API, clubJson, server, userJson } from '@/test/harness';

export const ME = 'u1';
export const CLUB = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
export const ROOM = '7c1d2e3f-0000-4000-8000-00000000a001';
export const ROOM_2 = '7c1d2e3f-0000-4000-8000-00000000a002';

export const msg = (id: string, text: string, overrides: Record<string, unknown> = {}) => ({
  id,
  senderId: 'u2',
  senderName: 'Grace Hopper',
  text,
  timestamp: new Date().toISOString(),
  isSystem: false,
  ...overrides,
});

export class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static reset() {
    FakeWebSocket.instances = [];
  }
  readyState = 0;
  onopen: ((ev: unknown) => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onclose: ((ev: unknown) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  sent: unknown[] = [];
  closed = false;
  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.readyState = 3;
  }
  /** Server side: complete the handshake, then answer the auth frame with a presence snapshot like the backend. */
  accept(snapshot: { userId: string; status: 'online' | 'offline' }[] = []) {
    this.readyState = 1;
    this.onopen?.({});
    this.push({ type: 'presence_snapshot', payload: snapshot });
  }
  push(frame: unknown) {
    this.onmessage?.({ data: JSON.stringify(frame) });
  }
  drop() {
    this.closed = true;
    this.readyState = 3;
    this.onclose?.({});
  }
}

export const sockets = () => FakeWebSocket.instances.filter((s) => !s.closed);

export interface ChatMock {
  tickets: { n: number };
  reads: { roomId: string; lastReadMessageId: string }[];
  sends: { roomId: string; text: string }[];
  messageFetches: { roomId: string; before: string | null }[];
}

interface Options {
  rooms?: { id: string; name: string; clubId?: string }[];
  messages?: Record<string, unknown[]>;
  unread?: Record<string, { unread_count: number; last_read_message_id: string | null }>;
  organizerId?: string;
  clubs?: { id: string; name: string; organizerId?: string }[];
}

export function mockChat(opts: Options = {}): ChatMock {
  const rooms = opts.rooms ?? [{ id: ROOM, name: 'General' }];
  const clubs = opts.clubs ?? [{ id: CLUB, name: 'Alpha Readers', organizerId: opts.organizerId ?? 'someone' }];
  const mock: ChatMock = { tickets: { n: 0 }, reads: [], sends: [], messageFetches: [] };
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ id: ME, displayName: 'Ada Lovelace' }))),
    http.get(`${API}/clubs/my`, () => HttpResponse.json(clubs.map((c) => clubJson(c)))),
    http.post(`${API}/auth/ws-ticket`, () => HttpResponse.json({ ticket: `ticket-${++mock.tickets.n}` })),
    http.get(`${API}/clubs/:clubId/chat/rooms`, ({ params }) =>
      HttpResponse.json(rooms.filter((r) => (r.clubId ?? clubs[0]?.id) === params['clubId']).map(({ id, name }) => ({ id, name }))),
    ),
    http.get(`${API}/chat/rooms/:roomId/messages`, ({ params, request }) => {
      const roomId = String(params['roomId']);
      mock.messageFetches.push({ roomId, before: new URL(request.url).searchParams.get('before_id') });
      return HttpResponse.json(opts.messages?.[roomId] ?? []);
    }),
    http.get(`${API}/chat/rooms/:roomId/unread-count`, ({ params }) => {
      const roomId = String(params['roomId']);
      return HttpResponse.json({ room_id: roomId, ...(opts.unread?.[roomId] ?? { unread_count: 0, last_read_message_id: null }) });
    }),
    http.post(`${API}/chat/rooms/:roomId/read`, async ({ params, request }) => {
      const body = (await request.json()) as { last_read_message_id: string };
      mock.reads.push({ roomId: String(params['roomId']), lastReadMessageId: body.last_read_message_id });
      return new HttpResponse(null, { status: 204 });
    }),
    http.post(`${API}/chat/rooms/:roomId/messages`, async ({ params, request }) => {
      const body = (await request.json()) as { text: string };
      mock.sends.push({ roomId: String(params['roomId']), text: body.text });
      return HttpResponse.json(msg(`saved-${mock.sends.length}`, body.text, { senderId: ME, senderName: 'Ada Lovelace' }));
    }),
  );
  return mock;
}
