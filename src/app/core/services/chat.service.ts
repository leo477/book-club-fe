import { Injectable, signal, computed, inject, effect, untracked, ApplicationRef, DestroyRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ChatItem, ChatMessage, ChatRoom, UnreadDivider } from '../models/chat.model';
import { extractApiError } from '../api/api-error.util';
import { AuthService } from '../auth/auth.service';
import { TokenStore } from '../auth/token.store';
import { ClubService } from './club.service';
import { ChatApi, ApiChatMessage } from './chat-api.service';
import { ChatSocket } from './chat-socket.service';

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly _appRef = inject(ApplicationRef);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _auth = inject(AuthService);
  private readonly _clubService = inject(ClubService);
  private readonly _tokenStore = inject(TokenStore);
  private readonly _api = inject(ChatApi);
  private readonly _socket = inject(ChatSocket);

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

  private currentUserId: string | null = null;
  private _audioContext: AudioContext | null = null;
  private _clubsLoadTriggered = false;

  constructor() {
    // Feature 3: force Angular (zoneless) to re-render immediately when the
    // browser tab becomes visible again (fixes "mobile chat doesn't update").
    const onVisibility = () => { if (!this.document.hidden) this._appRef.tick(); };
    this.document.addEventListener('visibilitychange', onVisibility);
    this._destroyRef.onDestroy(() =>
      this.document.removeEventListener('visibilitychange', onVisibility)
    );

    // Browsers keep a newly-created AudioContext suspended until a real user
    // gesture unlocks it; without this, the unread-message beep silently no-ops.
    const unlockAudio = () => {
      this._audioContext ??= new AudioContext();
      if (this._audioContext.state === 'suspended') void this._audioContext.resume();
    };
    this.document.addEventListener('click', unlockAudio, { once: true });
    this.document.addEventListener('keydown', unlockAudio, { once: true });
    this._destroyRef.onDestroy(() => {
      this.document.removeEventListener('click', unlockAudio);
      this.document.removeEventListener('keydown', unlockAudio);
    });

    // Single orchestrator for "load rooms for my clubs" — previously
    // duplicated in ChatWidgetComponent and ChatsComponent, which meant the
    // globally-mounted widget and the /chats page both fired
    // GET /clubs/{id}/chat/rooms on every visit.
    effect(() => {
      const user = this._auth.currentUser();
      if (!user) {
        this._clubsLoadTriggered = false;
        this.clearRooms();
        return;
      }

      const clubs = this._clubService.myClubs();
      if (clubs.length > 0) {
        this._clubsLoadTriggered = false;
        this.loadAllClubRooms(clubs, user.id);
      } else if (!this._clubsLoadTriggered) {
        this._clubsLoadTriggered = true;
        this._clubService.loadMyClubs().catch(() => undefined);
      }
    });

    // Single orchestrator for connecting the WS socket to the active room.
    effect(() => {
      const roomId = this._activeRoomId();
      // Read the token untracked so this effect only re-runs when the active
      // room changes — not on every token re-emit (e.g. after refresh), which
      // would tear down and reopen a still-connecting socket.
      const token = untracked(() => this._tokenStore.token());
      if (roomId && token) {
        this.connectRoom(roomId);
      } else if (!roomId) {
        this.disconnectRoom();
      }
    });
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
    const idx = lastReadId ? msgs.findIndex(m => m.id === lastReadId) : -1;
    // No match or last message already read → no divider
    const items: ChatItem[] =
      idx === -1 || idx >= msgs.length - 1
        ? msgs
        : [...msgs.slice(0, idx + 1), { id: 'unread-divider', isDivider: true } satisfies UnreadDivider, ...msgs.slice(idx + 1)];

    return items.map((item, i) => {
      if (item.isDivider) return item;
      const prev = items[i - 1];
      const next = items[i + 1];
      return {
        ...item,
        isGroupFirst: !prev || !!prev.isDivider || prev.senderId !== item.senderId,
        isGroupLast: !next || !!next.isDivider || next.senderId !== item.senderId,
      };
    });
  });

  // ── Public API ────────────────────────────────────────────────────────────

  /** Fetch chat rooms for a given club and seed the rooms signal. */
  loadRooms(clubId: string, userId?: string): void {
    if (userId !== undefined) {
      this.currentUserId = userId;
    }
    this._api.getClubRooms(clubId)
      .then(raw => {
        const rooms: ChatRoom[] = raw.map(r => ({ id: r.id, name: r.name, clubId, eventId: r.eventId }));
        this._rooms.set(rooms);
        this._autoSelectFirstRoom(rooms);
      })
      .catch((err: unknown) => {
        console.error('[ChatService] loadRooms error', err);
        this.notifyError(err);
      });
  }

  /** Fetch rooms for all user clubs in parallel and merge into one flat list. */
  loadAllClubRooms(clubs: { id: string; name: string }[], userId?: string): void {
    if (userId !== undefined) this.currentUserId = userId;

    const multipleClubs = clubs.length > 1;
    const requests = clubs.map(club =>
      this._api.getClubRooms(club.id)
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
      this._autoSelectFirstRoom(allRooms);
    }).catch((err: unknown) => {
      console.error('[ChatService] loadAllClubRooms error', err);
      this.notifyError(err);
    });
  }

  /** Fetch messages for a room and update the messages map. */
  loadMessages(roomId: string, params?: { before?: string; limit?: number }): void {
    this._api.getMessages(roomId, params)
      .then(raw => {
        const msgs: ChatMessage[] = raw.map(m => this.mapMessage(m));
        this._messages.update(map => ({ ...map, [roomId]: msgs }));
      })
      .catch((err: unknown) => {
        console.error('[ChatService] loadMessages error', err);
        this.notifyError(err);
      });
  }

  connectRoom(roomId: string): void {
    this._socket.connect(roomId, () => this._tokenStore.token(), {
      onMessage: payload => this._onWsMessage(roomId, payload as ApiChatMessage),
      onPresence: (userId, status) => {
        this._presenceMap.update(m => { const n = new Map(m); n.set(userId, status); return n; });
      },
      onPresenceSnapshot: entries => {
        const map = new Map<string, 'online' | 'offline'>();
        for (const e of entries) map.set(e.userId, e.status);
        this._presenceMap.set(map);
      },
    });
  }

  disconnectRoom(): void {
    this._presenceMap.set(new Map());
    this._socket.disconnect();
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
      this._api.getUnreadCount(roomId)
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
    // Never POST an optimistic temp id — the server expects a confirmed UUID.
    if (lastMsg.id.startsWith('temp-')) return;
    this._api.markRead(roomId, lastMsg.id).catch(() => undefined);
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
      text, timestamp: new Date(), isOwn: true, isSystem: false,
    };
    this._messages.update(map => ({ ...map, [roomId]: [...(map[roomId] ?? []), optimistic] }));

    this._api.sendMessage(roomId, text)
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
        this.notifyError(err);
      });
  }

  deleteMessage(messageId: string): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    this._api.deleteMessage(roomId, messageId)
      .then(() => {
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).filter(m => m.id !== messageId),
        }));
      })
      .catch((err: unknown) => {
        console.error('[ChatService] deleteMessage error', err);
        this.notifyError(err);
      });
  }

  banUserFromChat(userId: string, durationSeconds: number): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;
    this._api.banUser(roomId, userId, durationSeconds)
      .then(() => {
        this._messages.update(map => ({
          ...map,
          [roomId]: (map[roomId] ?? []).filter(m => m.senderId !== userId),
        }));
      })
      .catch((err: unknown) => {
        console.error('[ChatService] banUserFromChat error', err);
        this.notifyError(err);
      });
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this._api.deleteRoom(roomId);
    this._rooms.update(rooms => rooms.filter(r => r.id !== roomId));
    if (this._activeRoomId() === roomId) {
      this._activeRoomId.set(null);
      this.disconnectRoom();
    }
  }

  async createRoom(clubId: string, name: string): Promise<ChatRoom> {
    const raw = await this._api.createRoom(clubId, name);
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

  async getEventRoom(eventId: string, clubId = ''): Promise<ChatRoom | null> {
    try {
      const raw = await this._api.getEventRoom(eventId);
      const room: ChatRoom = { id: raw.id, name: raw.name, clubId, eventId: raw.eventId };
      this._upsertRoom(room);
      return room;
    } catch {
      return null;
    }
  }

  async createEventChatRoom(eventId: string, clubId = ''): Promise<ChatRoom> {
    const raw = await this._api.createEventChatRoom(eventId);
    const room: ChatRoom = { id: raw.id, name: raw.name, clubId, eventId: raw.eventId };
    this._upsertRoom(room);
    return room;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _autoSelectFirstRoom(rooms: ChatRoom[]): void {
    const currentId = this._activeRoomId();
    if (!currentId || !rooms.some(r => r.id === currentId)) {
      const first = rooms[0];
      if (first) {
        this._activeRoomId.set(first.id);
        this.loadMessages(first.id);
      }
    }
  }

  private _onWsMessage(roomId: string, payload: ApiChatMessage): void {
    const msg = this.mapMessage(payload);
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
  }

  /** Merge an event/club room into `_rooms`, deduped by id, so event rooms
   * feed the same room-list-driven pipelines (unread polling, chats list) as
   * club rooms instead of living outside them. */
  private _upsertRoom(room: ChatRoom): void {
    this._rooms.update(rooms =>
      rooms.some(r => r.id === room.id)
        ? rooms.map(r => (r.id === room.id ? room : r))
        : [...rooms, room],
    );
  }

  private _playBeep(): void {
    const ctx = this._audioContext ??= new AudioContext();
    if (ctx.state === 'suspended') return; // still locked, waiting for a user gesture
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

  private notifyError(err: unknown): void {
    toast.error(this.translate.instant(extractApiError(err)) as string);
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
      isSystem: m.isSystem ?? false,
    };
  }
}
