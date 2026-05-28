import { Injectable, signal, computed, inject, ApplicationRef, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChatItem, ChatMessage, ChatRoom, UnreadDivider } from '../models/chat.model';
import { environment } from '../../../environments/environment';

// ── Raw API shapes (snake_case) ──────────────────────────────────────────────

interface ApiChatRoom {
  id: string;
  name: string;
  eventId?: string;
}

interface ApiChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderDisplayName?: string;
  display_name?: string;
  sender_username?: string;
  text: string;
  timestamp: string; // ISO-8601
}

interface WsEnvelope { type: string; payload: unknown; }

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private readonly _appRef = inject(ApplicationRef);
  private readonly _destroyRef = inject(DestroyRef);

  // ── Private writable signals ───────────────────────────────────────────────

  private readonly _rooms = signal<ChatRoom[]>([]);
  private readonly _messages = signal<Record<string, ChatMessage[]>>({});
  private readonly _activeRoomId = signal<string | null>(null);
  private readonly _unreadCount = signal<number>(0);
  private readonly _isOpen = signal<boolean>(false);
  private readonly _hasNewMessage = signal<boolean>(false);
  private readonly _mutedUserIds = signal<Set<string>>(new Set());
  /** True while the /chats full-page route is active. Suppresses the FAB badge. */
  private readonly _isChatsPage = signal<boolean>(false);
  /** userId → 'online'|'offline' for the currently connected room. */
  private readonly _presenceMap = signal<Map<string, 'online' | 'offline'>>(new Map());
  /** roomId → id of the last message the current user has read (from server). */
  private readonly _lastReadMap = signal<Record<string, string | null>>({});
  /** roomId → number of unread messages (from server, reset locally on open). */
  private readonly _roomUnreadCounts = signal<Record<string, number>>({});

  private _ws: WebSocket | null = null;
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _reconnectDelay = 1_000;
  private _activeRoomToken: { roomId: string; token: string } | null = null;

  private currentUserId: string | null = null;

  constructor() {
    // Feature 3: force Angular (zoneless) to re-render immediately when the
    // browser tab becomes visible again (fixes "mobile chat doesn't update").
    const onVisibility = () => { if (!document.hidden) this._appRef.tick(); };
    document.addEventListener('visibilitychange', onVisibility);
    this._destroyRef.onDestroy(() =>
      document.removeEventListener('visibilitychange', onVisibility)
    );
  }

  // ── Public readonly signals ────────────────────────────────────────────────

  readonly rooms = this._rooms.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly activeRoomId = this._activeRoomId.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly hasNewMessage = this._hasNewMessage.asReadonly();
  readonly mutedUserIds = this._mutedUserIds.asReadonly();
  readonly presenceMap = this._presenceMap.asReadonly();
  readonly roomUnreadCounts = this._roomUnreadCounts.asReadonly();

  readonly activeRoom = computed(() =>
    this._rooms().find(r => r.id === this._activeRoomId()) ?? null,
  );

  readonly activeMessages = computed(() => {
    const msgs = this._messages()[this._activeRoomId() ?? ''] ?? [];
    const muted = this._mutedUserIds();
    return msgs.map(m => ({ ...m, isMuted: muted.has(m.senderId) }));
  });

  /**
   * Active messages with an `UnreadDivider` sentinel inserted after the last
   * read message. Used by templates to show "New messages ↓" separator and to
   * scroll-to-first-unread on room open.
   */
  readonly activeMessagesWithDivider = computed<ChatItem[]>(() => {
    const msgs = this.activeMessages();
    const lastReadId = this._lastReadMap()[this._activeRoomId() ?? ''];
    if (!lastReadId) return msgs;
    const idx = msgs.findIndex(m => m.id === lastReadId);
    // No match or last message already read → no divider
    if (idx === -1 || idx >= msgs.length - 1) return msgs;
    const divider: UnreadDivider = { id: 'unread-divider', isDivider: true };
    return [...msgs.slice(0, idx + 1), divider, ...msgs.slice(idx + 1)];
  });

  // ── Public API ────────────────────────────────────────────────────────────

  /** Fetch chat rooms for a given club and seed the rooms signal. */
  loadRooms(clubId: string, userId?: string): void {
    if (userId !== undefined) {
      this.currentUserId = userId;
    }
    firstValueFrom(this.http.get<ApiChatRoom[]>(`${this.api}/clubs/${clubId}/chat/rooms`))
      .then(raw => {
        const rooms: ChatRoom[] = raw.map(r => ({ id: r.id, name: r.name, clubId, eventId: r.eventId }));
        this._rooms.set(rooms);
        const currentId = this._activeRoomId();
        if (!currentId || !rooms.some(r => r.id === currentId)) {
          const first = rooms[0];
          if (first) {
            this._activeRoomId.set(first.id);
            this.loadMessages(first.id);
          }
        }
      })
      .catch((err: unknown) => console.error('[ChatService] loadRooms error', err));
  }

  /** Fetch rooms for all user clubs in parallel and merge into one flat list. */
  loadAllClubRooms(clubs: { id: string; name: string }[], userId?: string): void {
    if (userId !== undefined) this.currentUserId = userId;

    const multipleClubs = clubs.length > 1;
    const requests = clubs.map(club =>
      firstValueFrom(this.http.get<ApiChatRoom[]>(`${this.api}/clubs/${club.id}/chat/rooms`))
        .then(raw => raw.map(r => ({
          id: r.id,
          name: multipleClubs ? `${club.name} · ${r.name}` : r.name,
          clubId: club.id,
          eventId: r.eventId,
        })))
        .catch(() => [] as ChatRoom[]),
    );

    Promise.all(requests).then(results => {
      const allRooms = results.flat();
      this._rooms.set(allRooms);
      const currentId = this._activeRoomId();
      if (!currentId || !allRooms.some(r => r.id === currentId)) {
        const first = allRooms[0];
        if (first) {
          this._activeRoomId.set(first.id);
          this.loadMessages(first.id);
        }
      }
    }).catch((err: unknown) => console.error('[ChatService] loadAllClubRooms error', err));
  }

  /** Fetch messages for a room and update the messages map. */
  loadMessages(roomId: string, params?: { before?: string; limit?: number }): void {
    const query: Record<string, string> = {};
    if (params?.before) query['before'] = params.before;
    if (params?.limit != null) query['limit'] = String(params.limit);

    firstValueFrom(
      this.http.get<ApiChatMessage[]>(`${this.api}/chat/rooms/${roomId}/messages`, {
        params: query,
      }),
    )
      .then(raw => {
        const msgs: ChatMessage[] = raw.map(m => this.mapMessage(m));
        this._messages.update(map => ({ ...map, [roomId]: msgs }));
      })
      .catch((err: unknown) => console.error('[ChatService] loadMessages error', err));
  }

  connectRoom(roomId: string, token: string): void {
    this.disconnectRoom();
    this._activeRoomToken = { roomId, token };
    this._ws = new WebSocket(environment.wsUrl + '/chat/rooms/' + roomId + '?token=' + token);

    this._ws.onopen = () => { this._reconnectDelay = 1_000; };

    this._ws.onmessage = (event: MessageEvent) => {
      const envelope = JSON.parse(event.data as string) as WsEnvelope;

      // ── Presence events (Feature 4) ──────────────────────────────────────
      if (envelope.type === 'presence') {
        const p = envelope.payload as { userId: string; status: 'online' | 'offline' };
        this._presenceMap.update(m => { const n = new Map(m); n.set(p.userId, p.status); return n; });
        return;
      }
      if (envelope.type === 'presence_snapshot') {
        const entries = envelope.payload as { userId: string; status: 'online' | 'offline' }[];
        const map = new Map<string, 'online' | 'offline'>();
        for (const e of entries) map.set(e.userId, e.status);
        this._presenceMap.set(map);
        return;
      }

      if (envelope.type !== 'message') return;

      const msg = this.mapMessage(envelope.payload as ApiChatMessage);
      this._messages.update(map => {
        const existing = map[roomId] ?? [];
        if (existing.some(m => m.id === msg.id)) return map;
        const withoutTemp = existing.filter(
          m => !(m.id.startsWith('temp-') && m.senderId === msg.senderId && m.text === msg.text),
        );
        return { ...map, [roomId]: [...withoutTemp, msg] };
      });
      // Feature 1+2: only count incoming messages from others, and only when
      // the chat is not visible (widget closed AND not on /chats page).
      if (!msg.isOwn && !this._isOpen() && !this._isChatsPage()) {
        this._unreadCount.update(n => n + 1);
        this._hasNewMessage.set(true);
        this._playBeep();
      }
    };

    this._ws.onclose = () => {
      if (!this._activeRoomToken) return;
      this._reconnectTimer = setTimeout(() => {
        if (this._activeRoomToken) {
          this._reconnectDelay = Math.min(this._reconnectDelay * 2, 30_000);
          this.connectRoom(this._activeRoomToken.roomId, this._activeRoomToken.token);
        }
      }, this._reconnectDelay);
    };

    this._ws.onerror = () => this._ws?.close();
  }

  disconnectRoom(): void {
    this._activeRoomToken = null;
    this._presenceMap.set(new Map());
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    this._ws?.close();
    this._ws = null;
  }

  toggleOpen(): void {
    this._isOpen.update(v => !v);
    if (this._isOpen()) {
      this.markAsRead();
    }
  }

  openRoom(roomId: string): void {
    this.disconnectRoom();
    this._activeRoomId.set(roomId);
    this.loadMessages(roomId);
    this.markAsRead();
  }

  markAsRead(): void {
    this._unreadCount.set(0);
    this._hasNewMessage.set(false);
  }

  /** Feature 1: called by ChatsComponent and ChatWidgetComponent to suppress FAB badge. */
  setChatsPage(value: boolean): void {
    this._isChatsPage.set(value);
  }

  /**
   * Feature 5: fetch per-room unread counts and last-read message ids from the
   * server.  Fails gracefully — endpoint may not exist yet on older deployments.
   */
  fetchUnreadCounts(roomIds: string[]): void {
    for (const roomId of roomIds) {
      firstValueFrom(
        this.http.get<{ room_id: string; unread_count: number; last_read_message_id: string | null }>(
          `${this.api}/chat/rooms/${roomId}/unread-count`,
        ),
      )
        .then(data => {
          this._lastReadMap.update(m => ({ ...m, [roomId]: data.last_read_message_id ?? null }));
          this._roomUnreadCounts.update(m => ({ ...m, [roomId]: data.unread_count }));
        })
        .catch(() => undefined); // graceful — endpoint may not be deployed yet
    }
  }

  /**
   * Feature 5: mark all messages in a room as read up to the latest loaded
   * message.  Updates local state immediately and posts to the server.
   * Should be called when switching away from a room or sending a message.
   */
  markRoomRead(roomId: string): void {
    const msgs = this._messages()[roomId] ?? [];
    const lastMsg = msgs[msgs.length - 1];
    if (!lastMsg) return;
    this._lastReadMap.update(m => ({ ...m, [roomId]: lastMsg.id }));
    this._roomUnreadCounts.update(m => ({ ...m, [roomId]: 0 }));
    firstValueFrom(
      this.http.post(`${this.api}/chat/rooms/${roomId}/read`, { last_read_message_id: lastMsg.id }),
    ).catch(() => undefined);
  }

  clearRooms(): void {
    this.disconnectRoom();
    this._rooms.set([]);
    this._messages.set({});
    this._activeRoomId.set(null);
    this._unreadCount.set(0);
    this._hasNewMessage.set(false);
    this._isOpen.set(false);
    this._mutedUserIds.set(new Set());
    this._presenceMap.set(new Map());
    this._lastReadMap.set({});
    this._roomUnreadCounts.set({});
    this.currentUserId = null;
  }

  muteUser(userId: string): void {
    this._mutedUserIds.update(set => new Set([...set, userId]));
  }

  unmuteUser(userId: string): void {
    this._mutedUserIds.update(set => {
      const next = new Set(set);
      next.delete(userId);
      return next;
    });
  }

  sendMessage(text: string, currentUser: { id: string; displayName: string }): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    this.currentUserId = currentUser.id;

    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId, senderId: currentUser.id, senderName: currentUser.displayName,
      text, timestamp: new Date(), isOwn: true,
    };
    this._messages.update(map => ({ ...map, [roomId]: [...(map[roomId] ?? []), optimistic] }));

    firstValueFrom(
      this.http.post<ApiChatMessage>(`${this.api}/chat/rooms/${roomId}/messages`, { text }),
    )
      .then(saved => {
        const real = this.mapMessage(saved);
        // Replace optimistic entry with the confirmed message from the server.
        // If WS broadcast already delivered it, the dedup in onmessage handles the echo.
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).map(m => m.id === tempId ? real : m),
        }));
      })
      .catch((err: unknown) => {
        console.error('[ChatService] sendMessage error', err);
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).filter(m => m.id !== tempId),
        }));
      });
  }

  deleteMessage(messageId: string): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    firstValueFrom(
      this.http.delete(`${this.api}/chat/rooms/${roomId}/messages/${messageId}`),
    )
      .then(() => {
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).filter(m => m.id !== messageId),
        }));
      })
      .catch((err: unknown) => console.error('[ChatService] deleteMessage error', err));
  }

  banUserFromChat(userId: string, durationSeconds: number): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    firstValueFrom(
      this.http.post(`${this.api}/chat/rooms/${roomId}/ban`, {
        user_id: userId,
        duration_seconds: durationSeconds,
      }),
    )
      .then(() => {
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).filter(m => m.senderId !== userId),
        }));
      })
      .catch((err: unknown) => console.error('[ChatService] banUserFromChat error', err));
  }

  async deleteRoom(roomId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.api}/chat/rooms/${roomId}`),
    );
    this._rooms.update(rooms => rooms.filter(r => r.id !== roomId));
    if (this._activeRoomId() === roomId) {
      this._activeRoomId.set(null);
      this.disconnectRoom();
    }
  }

  async createRoom(clubId: string, name: string): Promise<ChatRoom> {
    const raw = await firstValueFrom(
      this.http.post<ApiChatRoom>(`${this.api}/clubs/${clubId}/chat/rooms`, { name }),
    );
    const room: ChatRoom = { id: raw.id, name: raw.name, clubId, eventId: raw.eventId };
    this._rooms.update(rooms => [...rooms, room]);
    return room;
  }

  openAndFocusRoom(room: ChatRoom): void {
    this.disconnectRoom();
    this._activeRoomId.set(room.id);
    this.loadMessages(room.id);
    this._isOpen.set(true);
    this.markAsRead();
  }

  async getEventRoom(eventId: string): Promise<ChatRoom | null> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiChatRoom>(`${this.api}/events/${eventId}/chat/room`),
      );
      return { id: raw.id, name: raw.name, clubId: '', eventId: raw.eventId };
    } catch {
      return null;
    }
  }

  async createEventChatRoom(eventId: string): Promise<ChatRoom> {
    const raw = await firstValueFrom(
      this.http.post<ApiChatRoom>(`${this.api}/events/${eventId}/chat/room`, {}),
    );
    const room: ChatRoom = { id: raw.id, name: raw.name, clubId: '', eventId: raw.eventId };
    this._rooms.update(rooms => [...rooms, room]);
    return room;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _playBeep(): void {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  private mapMessage(m: ApiChatMessage): ChatMessage {
    const raw = m.senderDisplayName ?? m.display_name ?? m.sender_username ?? m.senderName;
    const senderName = raw.includes('@') ? raw.split('@')[0] : raw;
    return {
      id: m.id,
      senderId: m.senderId,
      senderName,
      text: m.text,
      timestamp: new Date(m.timestamp),
      isOwn: m.senderId === this.currentUserId,
    };
  }
}
