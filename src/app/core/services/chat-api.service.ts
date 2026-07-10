import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SKIP_AUTH_REDIRECT } from '../interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';

// ── Raw API shapes (snake_case where the backend still uses it) ─────────────

export interface ApiChatRoom {
  id: string;
  name: string;
  eventId?: string;
}

export interface ApiChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderDisplayName?: string;
  display_name?: string;
  sender_username?: string;
  text: string;
  timestamp: string; // ISO-8601
  isSystem?: boolean;
}

export interface ApiUnreadCount {
  room_id: string;
  unread_count: number;
  last_read_message_id: string | null;
}

/**
 * Thin HTTP transport for chat — every method is a direct REST call with no
 * app state. ChatService owns the signal store and maps these raw shapes
 * onto view models (e.g. `isOwn` depends on the current user, which lives
 * in ChatService, not here).
 */
@Injectable({ providedIn: 'root' })
export class ChatApi {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getClubRooms(clubId: string): Promise<ApiChatRoom[]> {
    return firstValueFrom(this.http.get<ApiChatRoom[]>(`${this.api}/clubs/${clubId}/chat/rooms`));
  }

  getMessages(roomId: string, params?: { before?: string; limit?: number }): Promise<ApiChatMessage[]> {
    const query: Record<string, string> = {};
    if (params?.before) query['before'] = params.before;
    if (params?.limit != null) query['limit'] = String(params.limit);
    return firstValueFrom(
      this.http.get<ApiChatMessage[]>(`${this.api}/chat/rooms/${roomId}/messages`, { params: query }),
    );
  }

  getUnreadCount(roomId: string): Promise<ApiUnreadCount> {
    return firstValueFrom(this.http.get<ApiUnreadCount>(`${this.api}/chat/rooms/${roomId}/unread-count`));
  }

  markRead(roomId: string, lastReadMessageId: string): Promise<unknown> {
    return firstValueFrom(
      this.http.post(`${this.api}/chat/rooms/${roomId}/read`, { last_read_message_id: lastReadMessageId }),
    );
  }

  sendMessage(roomId: string, text: string): Promise<ApiChatMessage> {
    return firstValueFrom(this.http.post<ApiChatMessage>(`${this.api}/chat/rooms/${roomId}/messages`, { text }));
  }

  deleteMessage(roomId: string, messageId: string): Promise<unknown> {
    return firstValueFrom(this.http.delete(`${this.api}/chat/rooms/${roomId}/messages/${messageId}`));
  }

  banUser(roomId: string, userId: string, durationSeconds: number): Promise<unknown> {
    return firstValueFrom(
      this.http.post(`${this.api}/chat/rooms/${roomId}/ban`, {
        user_id: userId,
        duration_seconds: durationSeconds,
      }),
    );
  }

  deleteRoom(roomId: string): Promise<unknown> {
    return firstValueFrom(this.http.delete(`${this.api}/chat/rooms/${roomId}`));
  }

  createRoom(clubId: string, name: string): Promise<ApiChatRoom> {
    return firstValueFrom(this.http.post<ApiChatRoom>(`${this.api}/clubs/${clubId}/chat/rooms`, { name }));
  }

  getEventRoom(eventId: string): Promise<ApiChatRoom> {
    return firstValueFrom(
      this.http.get<ApiChatRoom>(`${this.api}/events/${eventId}/chat/room`, {
        context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
      }),
    );
  }

  createEventChatRoom(eventId: string): Promise<ApiChatRoom> {
    return firstValueFrom(this.http.post<ApiChatRoom>(`${this.api}/events/${eventId}/chat/room`, {}));
  }
}
