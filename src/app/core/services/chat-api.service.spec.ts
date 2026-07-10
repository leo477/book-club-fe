import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatApi } from './chat-api.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

describe('ChatApi', () => {
  let api: ChatApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), ChatApi],
    });
    api = TestBed.inject(ChatApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getClubRooms sends GET to /clubs/{id}/chat/rooms', async () => {
    const promise = api.getClubRooms('club-1');
    const req = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'r1', name: 'General' }]);
    expect(await promise).toEqual([{ id: 'r1', name: 'General' }]);
  });

  it('getMessages includes before/limit query params when provided', () => {
    api.getMessages('room-1', { before: 'cursor', limit: 10 });
    const req = httpMock.expectOne(r =>
      r.url === `${API}/chat/rooms/room-1/messages` &&
      r.params.get('before') === 'cursor' &&
      r.params.get('limit') === '10',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getUnreadCount sends GET to /chat/rooms/{id}/unread-count', async () => {
    const promise = api.getUnreadCount('room-1');
    httpMock.expectOne(`${API}/chat/rooms/room-1/unread-count`).flush({
      room_id: 'room-1', unread_count: 2, last_read_message_id: 'm1',
    });
    expect(await promise).toEqual({ room_id: 'room-1', unread_count: 2, last_read_message_id: 'm1' });
  });

  it('markRead sends POST with last_read_message_id', () => {
    api.markRead('room-1', 'm1');
    const req = httpMock.expectOne(`${API}/chat/rooms/room-1/read`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ last_read_message_id: 'm1' });
    req.flush(null);
  });

  it('sendMessage sends POST with text', async () => {
    const promise = api.sendMessage('room-1', 'hi');
    const req = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ text: 'hi' });
    req.flush({ id: 'm1', senderId: 'u1', senderName: 'Alice', text: 'hi', timestamp: '2024-01-01T00:00:00Z' });
    await promise;
  });

  it('deleteMessage sends DELETE', () => {
    api.deleteMessage('room-1', 'm1');
    const req = httpMock.expectOne(`${API}/chat/rooms/room-1/messages/m1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('banUser sends POST with user_id and duration_seconds', () => {
    api.banUser('room-1', 'u1', 3600);
    const req = httpMock.expectOne(`${API}/chat/rooms/room-1/ban`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user_id: 'u1', duration_seconds: 3600 });
    req.flush(null);
  });

  it('deleteRoom sends DELETE to /chat/rooms/{id}', () => {
    api.deleteRoom('room-1');
    const req = httpMock.expectOne(`${API}/chat/rooms/room-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('createRoom sends POST with name', async () => {
    const promise = api.createRoom('club-1', 'New Room');
    const req = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New Room' });
    req.flush({ id: 'r1', name: 'New Room' });
    expect(await promise).toEqual({ id: 'r1', name: 'New Room' });
  });

  it('getEventRoom sends GET to /events/{id}/chat/room', async () => {
    const promise = api.getEventRoom('event-1');
    httpMock.expectOne(`${API}/events/event-1/chat/room`).flush({ id: 'r1', name: 'Event Chat' });
    expect(await promise).toEqual({ id: 'r1', name: 'Event Chat' });
  });

  it('createEventChatRoom sends POST to /events/{id}/chat/room', async () => {
    const promise = api.createEventChatRoom('event-1');
    const req = httpMock.expectOne(`${API}/events/event-1/chat/room`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'r1', name: 'Event Chat', eventId: 'event-1' });
    expect(await promise).toEqual({ id: 'r1', name: 'Event Chat', eventId: 'event-1' });
  });
});
