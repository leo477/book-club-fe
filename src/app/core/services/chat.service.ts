import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChatMessage, ChatRoom } from '../models/chat.model';
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
  text: string;
  timestamp: string; // ISO-8601
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // ── Private writable signals ───────────────────────────────────────────────

  private readonly _rooms = signal<ChatRoom[]>([]);
  private readonly _messages = signal<Record<string, ChatMessage[]>>({});
  private readonly _activeRoomId = signal<string | null>(null);
  private readonly _unreadCount = signal<number>(0);
  private readonly _isOpen = signal<boolean>(false);
  private readonly _hasNewMessage = signal<boolean>(false);
  private readonly _mutedUserIds = signal<Set<string>>(new Set());

  // Tracks the current user id so we can mark own messages.
  private currentUserId: string | null = null;

  // ── Public readonly signals ────────────────────────────────────────────────

  readonly rooms = this._rooms.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly activeRoomId = this._activeRoomId.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly hasNewMessage = this._hasNewMessage.asReadonly();
  readonly mutedUserIds = this._mutedUserIds.asReadonly();

  readonly activeRoom = computed(() =>
    this._rooms().find(r => r.id === this._activeRoomId()) ?? null,
  );

  readonly activeMessages = computed(() => {
    const msgs = this._messages()[this._activeRoomId() ?? ''] ?? [];
    const muted = this._mutedUserIds();
    return msgs.map(m => ({ ...m, isMuted: muted.has(m.senderId) }));
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

  toggleOpen(): void {
    this._isOpen.update(v => !v);
    if (this._isOpen()) {
      this.markAsRead();
    }
  }

  openRoom(roomId: string): void {
    this._activeRoomId.set(roomId);
    this.loadMessages(roomId);
    this.markAsRead();
  }

  markAsRead(): void {
    this._unreadCount.set(0);
    this._hasNewMessage.set(false);
  }

  clearRooms(): void {
    this._rooms.set([]);
    this._messages.set({});
    this._activeRoomId.set(null);
    this._unreadCount.set(0);
    this._hasNewMessage.set(false);
    this._isOpen.set(false);
    this._mutedUserIds.set(new Set());
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

  /** Send a message to the active room, then reload messages from the API. */
  sendMessage(text: string, currentUser: { id: string; displayName: string }): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;

    this.currentUserId = currentUser.id;

    firstValueFrom(
      this.http.post<ApiChatMessage>(`${this.api}/chat/rooms/${roomId}/messages`, { text }),
    )
      .then(() => {
        // Reload messages to stay in sync with server state.
        this.loadMessages(roomId);
      })
      .catch((err: unknown) => console.error('[ChatService] sendMessage error', err));
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

  async createRoom(clubId: string, name: string): Promise<ChatRoom> {
    const raw = await firstValueFrom(
      this.http.post<ApiChatRoom>(`${this.api}/clubs/${clubId}/chat/rooms`, { name }),
    );
    const room: ChatRoom = { id: raw.id, name: raw.name, clubId, eventId: raw.eventId };
    this._rooms.update(rooms => [...rooms, room]);
    return room;
  }

  openAndFocusRoom(room: ChatRoom): void {
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

  private mapMessage(m: ApiChatMessage): ChatMessage {
    return {
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderName,
      text: m.text,
      timestamp: new Date(m.timestamp),
      isOwn: m.senderId === this.currentUserId,
    };
  }
}
