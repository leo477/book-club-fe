import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { logError } from '../utils/logger.util';

// Mirrors packages/api-client's maxAuthFailures: stop hammering a backend that keeps rejecting auth.
const MAX_AUTH_FAILURES = 3;

interface WsEnvelope { type: string; payload: unknown; }

export interface ChatSocketHandlers {
  onMessage: (payload: unknown) => void;
  onPresence: (userId: string, status: 'online' | 'offline') => void;
  onPresenceSnapshot: (entries: { userId: string; status: 'online' | 'offline' }[]) => void;
  onStopped: () => void;
}

/**
 * Owns the chat WebSocket lifecycle: connect/reconnect-with-backoff and
 * teardown. Message parsing is dispatched to the handlers passed to
 * `connect()` — ChatService owns what happens with a decoded message
 * (mapping, unread counts, the notification beep).
 */
@Injectable({ providedIn: 'root' })
export class ChatSocket {
  private _ws: WebSocket | null = null;
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _reconnectDelay = 1_000;
  private _authFailures = 0;
  private _activeRoom: { roomId: string; getTicket: () => Promise<string | null> } | null = null;

  connect(roomId: string, getTicket: () => Promise<string | null>, handlers: ChatSocketHandlers): void {
    // Idempotent: if a socket for the same room is already live, don't tear
    // it down — closing a CONNECTING socket triggers the browser's "closed
    // before the connection is established" warning and can loop.
    if (
      this._ws &&
      this._activeRoom?.roomId === roomId &&
      (this._ws.readyState === WebSocket.OPEN || this._ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    // A reconnect-timer call keeps the failure streak; a fresh/other-room connect restarts it.
    const continuing = this._activeRoom?.roomId === roomId;
    this.disconnect();
    if (!continuing) this._authFailures = 0;
    this._activeRoom = { roomId, getTicket };
    const ws = new WebSocket(environment.wsUrl + '/chat/rooms/' + roomId);
    this._ws = ws;

    let authenticated = false;

    ws.onopen = () => {
      getTicket()
        .then(ticket => {
          if (this._ws !== ws) return;
          if (!ticket) {
            // No valid ticket to authenticate with (e.g. user logged out) —
            // stop looping instead of hammering the backend with a dead
            // auth frame.
            this.disconnect();
            return;
          }
          ws.send(JSON.stringify({ type: 'auth', ticket }));
        })
        .catch(() => this.disconnect());
    };

    this._ws.onmessage = (event: MessageEvent) => {
      if (this._ws !== ws) return;
      if (!authenticated) {
        authenticated = true;
        this._authFailures = 0;
        this._reconnectDelay = 1_000;
      }
      try {
        const envelope = JSON.parse(event.data as string) as WsEnvelope;

        if (envelope.type === 'presence') {
          const p = envelope.payload as { userId: string; status: 'online' | 'offline' };
          handlers.onPresence(p.userId, p.status);
          return;
        }
        if (envelope.type === 'presence_snapshot') {
          handlers.onPresenceSnapshot(envelope.payload as { userId: string; status: 'online' | 'offline' }[]);
          return;
        }
        if (envelope.type !== 'message') return;
        handlers.onMessage(envelope.payload);
      } catch (err) {
        // A malformed/non-JSON frame (bad backend push, proxy noise) must not
        // kill the socket's event handler — drop the frame and keep listening.
        logError('[ChatSocket] onmessage parse error', err);
      }
    };

    this._ws.onclose = (event: CloseEvent) => {
      if (this._ws !== ws || !this._activeRoom) return;
      // 1008 after the first frame = server ended the session (kick/ban/room closed); before it = auth rejection, retry.
      if (authenticated && event?.code === 1008) {
        this._activeRoom = null;
        this._ws = null;
        handlers.onStopped();
        return;
      }
      if (!authenticated && event?.code === 1008 && ++this._authFailures >= MAX_AUTH_FAILURES) {
        this._activeRoom = null;
        this._ws = null;
        handlers.onStopped();
        return;
      }
      this._reconnectTimer = setTimeout(() => {
        const active = this._activeRoom;
        if (!active) return;
        // A fresh ticket is fetched per attempt on the reconnected socket's
        // onopen; if that fetch fails/returns null (e.g. logged out), the
        // loop aborts there instead of here.
        this._reconnectDelay = Math.min(this._reconnectDelay * 2, 30_000);
        this.connect(active.roomId, active.getTicket, handlers);
      }, this._reconnectDelay);
    };

    this._ws.onerror = () => { if (this._ws === ws) ws.close(); };
  }

  disconnect(): void {
    this._activeRoom = null;
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    this._ws?.close();
    this._ws = null;
  }
}
