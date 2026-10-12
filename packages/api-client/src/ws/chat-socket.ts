import { chatWsServerMessage, type ChatMessage, type ChatWsServerMessage } from '@book-club/contracts';

export type PresenceStatus = 'online' | 'offline';
/** `closed`: gave up or no session; `stopped`: the server ended an authenticated session with 1008 (kicked, banned, removed). Both are terminal until `reconnect()`. */
export type ChatSocketStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed' | 'stopped';
export type ChatSocketError = Extract<ChatWsServerMessage, { type: 'error' }>['payload'];

export interface ChatSocketLike {
  readonly readyState: number;
  onopen: ((ev: never) => void) | null;
  onmessage: ((ev: never) => void) | null;
  onclose: ((ev: never) => void) | null;
  onerror: ((ev: never) => void) | null;
  send(data: string): void;
  close(code?: number): void;
}

export interface ChatSocketOptions {
  /** `wss://host` without a path. */
  baseUrl: string;
  roomId: string;
  /** A fresh single-use ticket per call. `null` means there is no session: stop instead of retrying. A rejection is treated as transient. */
  getTicket: () => Promise<string | null>;
  onMessage?: (message: ChatMessage) => void;
  onPresence?: (userId: string, status: PresenceStatus) => void;
  onPresenceSnapshot?: (entries: { userId: string; status: PresenceStatus }[]) => void;
  onError?: (error: ChatSocketError) => void;
  onStatus?: (status: ChatSocketStatus) => void;
  createSocket?: (url: string) => ChatSocketLike;
  random?: () => number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Consecutive closes before the server ever answered the auth frame, after which the client gives up. */
  maxAuthFailures?: number;
}

export interface ChatSocket {
  /** Replaces the current connection with a new one (fresh ticket) and resets the backoff. For online/resume events. */
  reconnect(): void;
  send(text: string): boolean;
  close(): void;
  readonly status: ChatSocketStatus;
}

const OPEN = 1;
const NORMAL_CLOSURE = 1000;
const POLICY_VIOLATION = 1008;
export const MAX_MESSAGE_LENGTH = 2000;

export const backoffDelay = (attempt: number, base: number, max: number, random: number): number =>
  Math.round(Math.min(max, base * 2 ** attempt) * (0.5 + random * 0.5));

function parseFrame(data: unknown): ChatWsServerMessage | null {
  if (typeof data !== 'string') return null;
  try {
    const result = chatWsServerMessage.safeParse(JSON.parse(data));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function createChatSocket(options: ChatSocketOptions): ChatSocket {
  const { baseUrl, roomId, getTicket } = options;
  const baseDelay = options.baseDelayMs ?? 1_000;
  const maxDelay = options.maxDelayMs ?? 30_000;
  const maxAuthFailures = options.maxAuthFailures ?? 6;
  const random = options.random ?? Math.random;
  const create = options.createSocket ?? ((url: string): ChatSocketLike => new WebSocket(url));
  const url = `${baseUrl}/chat/rooms/${encodeURIComponent(roomId)}`;

  let status: ChatSocketStatus = 'idle';
  let socket: ChatSocketLike | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;
  let authFailures = 0;
  let generation = 0;
  let stopped = false;
  let disposed = false;

  const setStatus = (next: ChatSocketStatus) => {
    if (status === next) return;
    status = next;
    options.onStatus?.(next);
  };

  const detach = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    const old = socket;
    socket = null;
    if (old) {
      old.onopen = old.onmessage = old.onclose = old.onerror = null;
      try {
        old.close(NORMAL_CLOSURE);
      } catch {
        // already closed
      }
    }
  };

  const scheduleReconnect = (gen: number) => {
    if (stopped || gen !== generation) return;
    setStatus('reconnecting');
    const delay = backoffDelay(attempt, baseDelay, maxDelay, random());
    attempt += 1;
    timer = setTimeout(() => {
      timer = null;
      void connect(gen);
    }, delay);
  };

  async function connect(gen: number): Promise<void> {
    if (stopped || gen !== generation) return;
    setStatus(attempt === 0 ? 'connecting' : 'reconnecting');
    let ticket: string | null;
    try {
      ticket = await getTicket();
    } catch {
      scheduleReconnect(gen);
      return;
    }
    if (stopped || gen !== generation) return;
    if (!ticket) {
      stopped = true;
      setStatus('closed');
      return;
    }

    let authenticated = false;
    let ws: ChatSocketLike;
    try {
      ws = create(url);
    } catch {
      scheduleReconnect(gen);
      return;
    }
    socket = ws;

    ws.onopen = () => {
      if (socket !== ws) return;
      ws.send(JSON.stringify({ type: 'auth', ticket }));
    };
    ws.onmessage = (event: { data: unknown }) => {
      if (socket !== ws) return;
      const frame = parseFrame(event.data);
      if (!frame) return;
      if (!authenticated) {
        authenticated = true;
        attempt = 0;
        authFailures = 0;
        setStatus('open');
      }
      switch (frame.type) {
        case 'message':
          options.onMessage?.(frame.payload);
          break;
        case 'presence':
          options.onPresence?.(frame.payload.userId, frame.payload.status);
          break;
        case 'presence_snapshot':
          options.onPresenceSnapshot?.(frame.payload);
          break;
        case 'error':
          options.onError?.(frame.payload);
          break;
      }
    };
    ws.onerror = () => {
      if (socket === ws) ws.close();
    };
    ws.onclose = (event: { code?: number }) => {
      if (socket !== ws) return;
      socket = null;
      if (authenticated && event.code === POLICY_VIOLATION) {
        stopped = true;
        setStatus('stopped');
        return;
      }
      if (!authenticated) {
        authFailures += 1;
        if (authFailures >= maxAuthFailures) {
          stopped = true;
          setStatus('closed');
          return;
        }
      }
      scheduleReconnect(gen);
    };
  }

  const start = () => {
    generation += 1;
    attempt = 0;
    authFailures = 0;
    void connect(generation);
  };

  start();

  return {
    reconnect() {
      if (disposed) return;
      detach();
      stopped = false;
      start();
    },
    send(text) {
      if (!text.trim() || text.length > MAX_MESSAGE_LENGTH) return false;
      if (!socket || socket.readyState !== OPEN || status !== 'open') return false;
      socket.send(JSON.stringify({ text }));
      return true;
    },
    close() {
      disposed = true;
      stopped = true;
      generation += 1;
      detach();
      setStatus('closed');
    },
    get status() {
      return status;
    },
  };
}
