import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocketServer, type WebSocket as ServerSocket } from 'ws';
import { backoffDelay, createChatSocket, type ChatSocket, type ChatSocketOptions, type ChatSocketStatus } from '../src';

const message = (id: string, text = 'hi') => ({ type: 'message', payload: { id, senderId: 'u2', senderName: 'Grace', text, timestamp: '2026-01-01T10:00:00Z', isSystem: false } });

interface Conn {
  ws: ServerSocket;
  path: string;
  frames: unknown[];
}

let wss: WebSocketServer;
let conns: Conn[];
let onConnect: (conn: Conn) => void;
let open: ChatSocket[];

const url = () => `ws://127.0.0.1:${(wss.address() as AddressInfo).port}`;

async function until(check: () => boolean, ms = 3_000) {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 5));
  }
}

function start(overrides: Partial<ChatSocketOptions> = {}) {
  const events: unknown[] = [];
  const statuses: ChatSocketStatus[] = [];
  let n = 0;
  const getTicket = vi.fn(async () => `t${++n}`);
  const socket = createChatSocket({
    baseUrl: url(),
    roomId: 'room 1',
    getTicket,
    baseDelayMs: 10,
    maxDelayMs: 40,
    random: () => 1,
    onMessage: (m) => events.push(['message', m.id, m.text]),
    onPresence: (u, s) => events.push(['presence', u, s]),
    onPresenceSnapshot: (e) => events.push(['snapshot', e]),
    onError: (e) => events.push(['error', e.code]),
    onStatus: (s) => statuses.push(s),
    ...overrides,
  });
  open.push(socket);
  return { socket, events, statuses, getTicket };
}

beforeEach(async () => {
  conns = [];
  open = [];
  onConnect = () => {};
  wss = new WebSocketServer({ port: 0, host: '127.0.0.1' });
  wss.on('connection', (ws, req) => {
    const conn: Conn = { ws, path: req.url ?? '', frames: [] };
    conns.push(conn);
    ws.on('message', (data) => {
      conn.frames.push(JSON.parse(String(data)));
      if (conn.frames.length === 1) onConnect(conn);
    });
  });
  await new Promise<void>((resolve) => wss.once('listening', resolve));
});

afterEach(async () => {
  for (const s of open) s.close();
  for (const c of wss.clients) c.terminate();
  await new Promise<void>((resolve) => wss.close(() => resolve()));
});

describe('backoffDelay', () => {
  it('doubles up to the cap and jitters between 50% and 100%', () => {
    expect([0, 1, 2, 3, 10].map((a) => backoffDelay(a, 1_000, 30_000, 1))).toEqual([1_000, 2_000, 4_000, 8_000, 30_000]);
    expect(backoffDelay(2, 1_000, 30_000, 0)).toBe(2_000);
    expect(backoffDelay(0, 1_000, 30_000, 0.5)).toBe(750);
  });
});

describe('createChatSocket', () => {
  it('fetches a ticket, sends it as the first frame, then dispatches parsed frames', async () => {
    onConnect = ({ ws }) => {
      ws.send(JSON.stringify({ type: 'presence_snapshot', payload: [{ userId: 'u2', status: 'online' }] }));
      ws.send(JSON.stringify({ type: 'presence', payload: { userId: 'u3', status: 'offline' } }));
      ws.send(JSON.stringify(message('m1', '<b>x</b>')));
      ws.send(JSON.stringify({ type: 'error', payload: { code: 'RATE_LIMITED', message: 'slow' } }));
    };
    const { events, statuses, getTicket } = start();
    await until(() => events.length === 4);
    expect(conns[0]?.path).toBe('/chat/rooms/room%201');
    expect(conns[0]?.frames).toEqual([{ type: 'auth', ticket: 't1' }]);
    expect(getTicket).toHaveBeenCalledTimes(1);
    expect(events).toEqual([
      ['snapshot', [{ userId: 'u2', status: 'online' }]],
      ['presence', 'u3', 'offline'],
      ['message', 'm1', '<b>x</b>'],
      ['error', 'RATE_LIMITED'],
    ]);
    expect(statuses).toEqual(['connecting', 'open']);
  });

  it('drops malformed, non-JSON and unknown frames without dying', async () => {
    onConnect = ({ ws }) => {
      ws.send('not json');
      ws.send(JSON.stringify({ type: 'nope', payload: 1 }));
      ws.send(JSON.stringify({ type: 'message', payload: { id: 1 } }));
      ws.send(JSON.stringify(message('ok')));
    };
    const { events } = start();
    await until(() => events.length === 1);
    expect(events).toEqual([['message', 'ok', 'hi']]);
  });

  it('sends {text} only while open', async () => {
    onConnect = ({ ws }) => ws.send(JSON.stringify({ type: 'presence_snapshot', payload: [] }));
    const { socket } = start();
    expect(socket.send('too early')).toBe(false);
    await until(() => socket.status === 'open');
    expect(socket.send('hello')).toBe(true);
    await until(() => conns[0]?.frames.length === 2);
    expect(conns[0]?.frames[1]).toEqual({ text: 'hello' });
  });

  it('reconnects after the server drops with a fresh ticket every time', async () => {
    onConnect = ({ ws }) => ws.send(JSON.stringify({ type: 'presence_snapshot', payload: [] }));
    const { getTicket, statuses } = start();
    await until(() => conns.length === 1);
    await until(() => statuses.includes('open'));
    conns[0]?.ws.terminate();
    await until(() => conns.length === 2);
    conns[1]?.ws.terminate();
    await until(() => conns.length === 3);
    expect(getTicket).toHaveBeenCalledTimes(3);
    expect(conns.map((c) => (c.frames[0] as { ticket: string }).ticket)).toEqual(['t1', 't2', 't3']);
    expect(statuses).toContain('reconnecting');
  });

  it('backs off exponentially while the connection never authenticates, then gives up', async () => {
    onConnect = ({ ws }) => ws.close(1008);
    const stamps: number[] = [];
    wss.on('connection', () => stamps.push(Date.now()));
    const { socket, getTicket } = start({ maxAuthFailures: 4, baseDelayMs: 40, maxDelayMs: 1_000 });
    await until(() => socket.status === 'closed');
    expect(getTicket).toHaveBeenCalledTimes(4);
    const gaps = stamps.slice(1).map((t, i) => t - (stamps[i] ?? 0));
    expect(gaps[1]).toBeGreaterThan(gaps[0] ?? 0);
    expect(gaps[2]).toBeGreaterThan(gaps[1] ?? 0);
  });

  it('stops without a socket when there is no ticket (logged out)', async () => {
    const { socket, statuses } = start({ getTicket: async () => null });
    await until(() => socket.status === 'closed');
    await new Promise((r) => setTimeout(r, 80));
    expect(conns).toHaveLength(0);
    expect(statuses).toEqual(['connecting', 'closed']);
  });

  it('retries a transient ticket failure', async () => {
    onConnect = ({ ws }) => ws.send(JSON.stringify({ type: 'presence_snapshot', payload: [] }));
    let calls = 0;
    const { socket } = start({
      getTicket: async () => {
        if (++calls < 3) throw new Error('offline');
        return 'good';
      },
    });
    await until(() => socket.status === 'open');
    expect(calls).toBe(3);
    expect(conns[0]?.frames[0]).toEqual({ type: 'auth', ticket: 'good' });
  });

  it('reconnect() replaces a live connection with a new ticket and closes the old one', async () => {
    onConnect = ({ ws }) => ws.send(JSON.stringify({ type: 'presence_snapshot', payload: [] }));
    const { socket } = start();
    await until(() => socket.status === 'open');
    const closed = new Promise<void>((resolve) => conns[0]?.ws.once('close', () => resolve()));
    socket.reconnect();
    await closed;
    await until(() => conns.length === 2 && socket.status === 'open');
    expect(conns[1]?.frames[0]).toEqual({ type: 'auth', ticket: 't2' });
  });

  it('close() stops reconnecting, closes the socket cleanly and ignores later reconnect()', async () => {
    onConnect = ({ ws }) => ws.send(JSON.stringify({ type: 'presence_snapshot', payload: [] }));
    const { socket, getTicket } = start();
    await until(() => socket.status === 'open');
    const code = new Promise<number>((resolve) => conns[0]?.ws.once('close', (c) => resolve(c)));
    socket.close();
    expect(await code).toBe(1000);
    socket.reconnect();
    await new Promise((r) => setTimeout(r, 100));
    expect(conns).toHaveLength(1);
    expect(getTicket).toHaveBeenCalledTimes(1);
    expect(socket.status).toBe('closed');
  });

  it('close() while the ticket is in flight never opens a socket', async () => {
    let release: (t: string) => void = () => {};
    const { socket } = start({ getTicket: () => new Promise<string>((r) => (release = r)) });
    socket.close();
    release('late');
    await new Promise((r) => setTimeout(r, 80));
    expect(conns).toHaveLength(0);
  });
});
