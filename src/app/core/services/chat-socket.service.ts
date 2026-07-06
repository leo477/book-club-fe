import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { logError } from '../utils/logger.util';

interface WsEnvelope { type: string; payload: unknown; }

export interface ChatSocketHandlers {
  onMessage: (payload: unknown) => void;
  onPresence: (userId: string, status: 'online' | 'offline') => void;
  onPresenceSnapshot: (entries: { userId: string; status: 'online' | 'offline' }[]) => void;
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
  private _activeRoom: { roomId: string; getToken: () => string | null } | null = null;

  connect(roomId: string, getToken: () => string | null, handlers: ChatSocketHandlers): void {
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
    this.disconnect();
    this._activeRoom = { roomId, getToken };
    this._ws = new WebSocket(environment.wsUrl + '/chat/rooms/' + roomId);

    this._ws.onopen = () => {
      this._reconnectDelay = 1_000;
      this._ws?.send(JSON.stringify({ type: 'auth', token: getToken() }));
    };

    this._ws.onmessage = (event: MessageEvent) => {
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

    this._ws.onclose = () => {
      if (!this._activeRoom) return;
      this._reconnectTimer = setTimeout(() => {
        const active = this._activeRoom;
        if (!active) return;
        const freshToken = active.getToken();
        if (!freshToken) {
          // No valid token to reconnect with (e.g. user logged out) — stop
          // looping instead of hammering the backend with a dead auth frame.
          this.disconnect();
          return;
        }
        this._reconnectDelay = Math.min(this._reconnectDelay * 2, 30_000);
        this.connect(active.roomId, active.getToken, handlers);
      }, this._reconnectDelay);
    };

    this._ws.onerror = () => this._ws?.close();
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
