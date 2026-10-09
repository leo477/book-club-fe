import {
  bookDetails,
  bookSuggestion,
  chatMessage,
  chatRoom,
  geocodeSuggestion,
  mapsKeyConfig,
  randomizerSession,
  storeResult,
  submission,
  unreadCount,
  uploadResult,
  walkingRoute,
  type CreateRandomizerSessionRequest,
  type CreateSubmissionRequest,
  type SubmissionStatus,
  type SubmissionType,
  type UpdateSubmissionStatusRequest,
} from '@book-club/contracts';
import { z } from 'zod';
import type { ApiClient } from '../client';
import type { RequestOptions } from '../types';

type CallOptions = Pick<RequestOptions, 'signal' | 'skipAuthRedirect' | 'suppressErrorToast'>;

export const randomizerApi = (c: ApiClient) => ({
  history: (clubId: string, page: { skip?: number; limit?: number } = {}, options?: CallOptions) =>
    c.get(`/clubs/${clubId}/randomizer/history`, z.array(randomizerSession), { ...options, query: { ...page } }),
  createSession: (clubId: string, body: CreateRandomizerSessionRequest) =>
    c.post(`/clubs/${clubId}/randomizer/sessions`, randomizerSession, body),
});

export const supportApi = (c: ApiClient) => ({
  list: (filter: { type?: SubmissionType; status?: SubmissionStatus } = {}) =>
    c.get('/support', z.array(submission), { query: { ...filter } }),
  create: (body: CreateSubmissionRequest) => c.post('/support', submission, body),
  updateStatus: (id: string, status: UpdateSubmissionStatusRequest['status']) =>
    c.patch(`/support/${id}/status`, submission, { status }),
  like: (id: string) => c.post(`/support/${id}/like`, submission, {}),
  unlike: (id: string) => c.delete(`/support/${id}/like`, z.void()),
});

export const chatApi = (c: ApiClient) => ({
  clubRooms: (clubId: string) => c.get(`/clubs/${clubId}/chat/rooms`, z.array(chatRoom)),
  createClubRoom: (clubId: string, name: string) => c.post(`/clubs/${clubId}/chat/rooms`, chatRoom, { name }),
  eventRoom: (eventId: string) => c.get(`/events/${eventId}/chat/room`, chatRoom),
  createEventRoom: (eventId: string) => c.post(`/events/${eventId}/chat/room`, chatRoom, {}),
  deleteRoom: (roomId: string) => c.delete(`/chat/rooms/${roomId}`, z.void()),
  messages: (roomId: string, page: { beforeId?: string; limit?: number } = {}) =>
    c.get(`/chat/rooms/${roomId}/messages`, z.array(chatMessage), {
      query: { before_id: page.beforeId, limit: page.limit },
    }),
  send: (roomId: string, text: string) => c.post(`/chat/rooms/${roomId}/messages`, chatMessage, { text }),
  deleteMessage: (roomId: string, messageId: string) =>
    c.delete(`/chat/rooms/${roomId}/messages/${messageId}`, z.void()),
  ban: (roomId: string, userId: string, durationSeconds: number) =>
    c.post(`/chat/rooms/${roomId}/ban`, z.void(), { user_id: userId, duration_seconds: durationSeconds }),
  markRead: (roomId: string, lastReadMessageId: string) =>
    c.post(`/chat/rooms/${roomId}/read`, z.void(), { last_read_message_id: lastReadMessageId }),
  unreadCount: (roomId: string) => c.get(`/chat/rooms/${roomId}/unread-count`, unreadCount),
});

export const booksApi = (c: ApiClient) => ({
  search: (q: string, limit = 5, options?: CallOptions) =>
    c.get('/books/search', z.array(bookSuggestion), { ...options, query: { q, limit } }),
  details: (bookId: string) => c.get(`/books/details/${bookId}`, bookDetails),
  stores: (title: string) => c.get('/books/stores', z.array(storeResult), { query: { title } }),
});

export const geocodeApi = (c: ApiClient) => ({
  autocomplete: (q: string, sessionToken?: string, lang = 'uk', limit = 5, options?: CallOptions) =>
    c.get('/geocode/autocomplete', z.array(geocodeSuggestion), {
      ...options,
      query: { q, lang, limit, session_token: sessionToken },
    }),
  placeDetails: (placeId: string, sessionToken: string, lang = 'uk', options?: CallOptions) =>
    c.get('/geocode/place-details', geocodeSuggestion, {
      ...options,
      query: { place_id: placeId, session_token: sessionToken, lang },
    }),
  walkingRoute: (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }, options?: { suppressErrorToast?: boolean }) =>
    c.get('/routes/walking', walkingRoute, {
      ...options,
      query: { origin_lat: origin.lat, origin_lng: origin.lng, dest_lat: dest.lat, dest_lng: dest.lng },
    }),
});

export const uploadApi = (c: ApiClient) => ({
  cover: (form: FormData) => c.post('/upload/cover', uploadResult, form),
});

export const configApi = (c: ApiClient) => ({
  mapsKey: (options?: { suppressErrorToast?: boolean }) => c.get('/config/maps-key', mapsKeyConfig, options),
});
