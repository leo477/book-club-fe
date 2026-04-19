import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { environment } from '../../../environments/environment';

// ── Raw API shapes (snake_case) ──────────────────────────────────────────────

interface ApiChatRoom {
  id: string;
  name: string;
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

  // Tracks the current user id so we can mark own messages.
  private currentUserId: string | null = null;

  // ── Public readonly signals ────────────────────────────────────────────────

  readonly rooms = this._rooms.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly activeRoomId = this._activeRoomId.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly hasNewMessage = this._hasNewMessage.asReadonly();

  readonly activeRoom = computed(() =>
    this._rooms().find(r => r.id === this._activeRoomId()) ?? null,
  );

  readonly activeMessages = computed(
    () => this._messages()[this._activeRoomId() ?? ''] ?? [],
  );

  // ── Public API ────────────────────────────────────────────────────────────

  /** Fetch chat rooms for a given club and seed the rooms signal. */
  loadRooms(clubId: string, userId?: string): void {
    if (userId !== undefined) {
      this.currentUserId = userId;
    }
    firstValueFrom(this.http.get<ApiChatRoom[]>(`${this.api}/clubs/${clubId}/chat/rooms`))
      .then(raw => {
        const rooms: ChatRoom[] = raw.map(r => ({ id: r.id, name: r.name }));
        this._rooms.set(rooms);
        // Auto-select the first room when none is active or active room is gone.
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
