import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ChatSocket, ChatSocketHandlers } from './chat-socket.service';
import { environment } from '../../../environments/environment';

class MockWebSocket {
  static instance: MockWebSocket | null = null;
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  onopen: (() => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = MockWebSocket.CONNECTING;
  close = vi.fn(() => { this.readyState = MockWebSocket.CLOSED; });
  send = vi.fn();
  constructor(public url: string) { MockWebSocket.instance = this; }
  simulateMessage(data: object) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
  simulateClose() { this.readyState = MockWebSocket.CLOSED; this.onclose?.(); }
  simulateError() { this.onerror?.(); }
}

function makeHandlers(): ChatSocketHandlers {
  return {
    onMessage: vi.fn(),
    onPresence: vi.fn(),
    onPresenceSnapshot: vi.fn(),
  };
}

describe('ChatSocket', () => {
  let socket: ChatSocket;
  const WS_BASE = environment.wsUrl;

  beforeEach(() => {
    MockWebSocket.instance = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).WebSocket = MockWebSocket;
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), ChatSocket] });
    socket = TestBed.inject(ChatSocket);
  });

  it('creates a WebSocket with the correct URL and sends the auth frame on open', () => {
    socket.connect('room-1', () => 'tok', makeHandlers());
    const ws = MockWebSocket.instance;
    expect(ws?.url).toBe(`${WS_BASE}/chat/rooms/room-1`);
    ws?.onopen?.();
    expect(ws?.send).toHaveBeenCalledWith(JSON.stringify({ type: 'auth', token: 'tok' }));
  });

  it('dispatches a decoded message envelope to onMessage', () => {
    const handlers = makeHandlers();
    socket.connect('room-1', () => 'tok', handlers);
    const payload = { id: 'm1', senderId: 'u1', senderName: 'Alice', text: 'Hi', timestamp: '2024-01-01T00:00:00Z' };
    MockWebSocket.instance?.simulateMessage({ type: 'message', payload });
    expect(handlers.onMessage).toHaveBeenCalledWith(payload);
  });

  it('dispatches presence updates to onPresence', () => {
    const handlers = makeHandlers();
    socket.connect('room-1', () => 'tok', handlers);
    MockWebSocket.instance?.simulateMessage({ type: 'presence', payload: { userId: 'u1', status: 'online' } });
    expect(handlers.onPresence).toHaveBeenCalledWith('u1', 'online');
  });

  it('dispatches a presence snapshot to onPresenceSnapshot', () => {
    const handlers = makeHandlers();
    socket.connect('room-1', () => 'tok', handlers);
    const entries = [{ userId: 'u1', status: 'online' as const }];
    MockWebSocket.instance?.simulateMessage({ type: 'presence_snapshot', payload: entries });
    expect(handlers.onPresenceSnapshot).toHaveBeenCalledWith(entries);
  });

  it('disconnect closes the socket', () => {
    socket.connect('room-1', () => 'tok', makeHandlers());
    const ws = MockWebSocket.instance;
    socket.disconnect();
    expect(ws?.close).toHaveBeenCalled();
  });

  it('is idempotent while CONNECTING for the same room', () => {
    socket.connect('room-1', () => 'tok', makeHandlers());
    const firstWs = MockWebSocket.instance;
    socket.connect('room-1', () => 'tok', makeHandlers());
    expect(firstWs?.close).not.toHaveBeenCalled();
    expect(MockWebSocket.instance).toBe(firstWs);
  });

  it('is idempotent for the same room even when the token getter changes', () => {
    socket.connect('room-1', () => 'tok', makeHandlers());
    const firstWs = MockWebSocket.instance;
    socket.connect('room-1', () => 'a-different-token', makeHandlers());
    expect(firstWs?.close).not.toHaveBeenCalled();
    expect(MockWebSocket.instance).toBe(firstWs);
  });

  it('reconnects when the room id changes', () => {
    socket.connect('room-1', () => 'tok', makeHandlers());
    const firstWs = MockWebSocket.instance;
    socket.connect('room-2', () => 'tok', makeHandlers());
    expect(firstWs?.close).toHaveBeenCalled();
    expect(MockWebSocket.instance?.url).toBe(`${WS_BASE}/chat/rooms/room-2`);
  });

  it('onerror closes the socket', () => {
    socket.connect('room-1', () => 'tok', makeHandlers());
    const ws = MockWebSocket.instance;
    ws?.simulateError();
    expect(ws?.close).toHaveBeenCalled();
  });

  it('reconnects with backoff after an unexpected close', () => {
    vi.useFakeTimers();
    socket.connect('room-1', () => 'tok', makeHandlers());
    const firstWs = MockWebSocket.instance;
    firstWs?.simulateClose();

    vi.advanceTimersByTime(1_100);

    const secondWs = MockWebSocket.instance;
    expect(secondWs).not.toBe(firstWs);
    expect(secondWs?.url).toBe(`${WS_BASE}/chat/rooms/room-1`);
    vi.useRealTimers();
  });

  it('reconnects using the CURRENT token from the getter, not the connect-time snapshot', () => {
    vi.useFakeTimers();
    let currentToken = 'stale-token';
    socket.connect('room-1', () => currentToken, makeHandlers());
    const firstWs = MockWebSocket.instance;

    currentToken = 'fresh-token';
    firstWs?.simulateClose();
    vi.advanceTimersByTime(1_100);

    const secondWs = MockWebSocket.instance;
    expect(secondWs).not.toBe(firstWs);
    secondWs?.onopen?.();
    expect(secondWs?.send).toHaveBeenCalledWith(JSON.stringify({ type: 'auth', token: 'fresh-token' }));
    vi.useRealTimers();
  });

  it('disconnects instead of reconnecting when the token getter returns null at reconnect time', () => {
    vi.useFakeTimers();
    let currentToken: string | null = 'tok';
    socket.connect('room-1', () => currentToken, makeHandlers());
    const firstWs = MockWebSocket.instance;

    currentToken = null;
    firstWs?.simulateClose();
    vi.advanceTimersByTime(5_000);

    expect(MockWebSocket.instance).toBe(firstWs);

    // Confirm the reconnect loop is fully torn down, not merely paused: a
    // later close of a would-be new socket must not schedule another attempt.
    vi.advanceTimersByTime(30_000);
    expect(MockWebSocket.instance).toBe(firstWs);
    vi.useRealTimers();
  });

  it('does not reconnect after an explicit disconnect', () => {
    vi.useFakeTimers();
    socket.connect('room-1', () => 'tok', makeHandlers());
    const ws = MockWebSocket.instance;
    socket.disconnect();
    ws?.simulateClose();

    vi.advanceTimersByTime(5_000);
    expect(MockWebSocket.instance).toBe(ws);
    vi.useRealTimers();
  });

  it('onopen resets the reconnect delay back to 1000ms', () => {
    socket.connect('room-1', () => 'tok', makeHandlers());
    const ws = MockWebSocket.instance;
    (socket as unknown as { _reconnectDelay: number })._reconnectDelay = 8_000;
    ws?.onopen?.();
    expect((socket as unknown as { _reconnectDelay: number })._reconnectDelay).toBe(1_000);
  });
});
