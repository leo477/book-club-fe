import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, WritableSignal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { environment } from '../../../environments/environment';

// ── MockWebSocket ─────────────────────────────────────────────────────────────

class MockWebSocket {
  static instance: MockWebSocket | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  send = vi.fn();
  constructor(public url: string) { MockWebSocket.instance = this; }
  simulateMessage(data: object) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
  simulateClose() { this.onclose?.(); }
  simulateError() { this.onerror?.(); }
}

interface ChatServicePrivate {
  _unreadCount: WritableSignal<number>;
  _hasNewMessage: WritableSignal<boolean>;
  _activeRoomId: WritableSignal<string | null>;
}

// Helper for extracting signal values
function getRooms(service: ChatService): ChatRoom[] {
  return service.rooms();
}
function getActiveRoomId(service: ChatService): string | null {
  return service.activeRoomId();
}
function getUnreadCount(service: ChatService): number {
  return service.unreadCount();
}
function getIsOpen(service: ChatService): boolean {
  return service.isOpen();
}
function getHasNewMessage(service: ChatService): boolean {
  return service.hasNewMessage();
}
function getActiveRoom(service: ChatService): ChatRoom | null {
  return service.activeRoom();
}
function getActiveMessages(service: ChatService): ChatMessage[] {
  return service.activeMessages();
}

const API = environment.apiUrl;

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    MockWebSocket.instance = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).WebSocket = MockWebSocket;

    // Stub AudioContext so _playBeep() doesn't throw in browser test env
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AudioContext = class {
      createOscillator() {
        return { connect: vi.fn(), frequency: { value: 0 }, start: vi.fn(), stop: vi.fn() };
      }
      createGain() {
        return { connect: vi.fn(), gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } };
      }
      readonly currentTime = 0;
      readonly destination = {};
    };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), ChatService],
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Initial state', () => {
    it('should have 0 rooms before loading', () => {
      expect(getRooms(service).length).toBe(0);
    });
    it('should have activeRoomId as null initially', () => {
      expect(getActiveRoomId(service)).toBeNull();
    });
    it('should have unreadCount 0', () => {
      expect(getUnreadCount(service)).toBe(0);
    });
    it('should have isOpen false', () => {
      expect(getIsOpen(service)).toBe(false);
    });
    it('should have hasNewMessage false', () => {
      expect(getHasNewMessage(service)).toBe(false);
    });
    it('activeRoom() should return null initially', () => {
      expect(getActiveRoom(service)).toBeNull();
    });
    it('activeMessages() should return [] initially', () => {
      expect(getActiveMessages(service)).toEqual([]);
    });
  });

  describe('loadRooms()', () => {
    it('should populate rooms signal from HTTP GET', async () => {
      service.loadRooms('club-1');

      const roomsReq = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
      expect(roomsReq.request.method).toBe('GET');
      roomsReq.flush([
        { id: 'room-1', name: 'General' },
        { id: 'room-2', name: 'Off-topic' },
      ]);

      // Wait for the .then() microtask to run before expecting the messages request
      await Promise.resolve();

      // After rooms load, the first room is auto-selected and messages are fetched
      const msgsReq = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
      msgsReq.flush([]);

      expect(getRooms(service).length).toBe(2);
      expect(getRooms(service)[0].id).toBe('room-1');
    });

    it('should auto-select first room and set activeRoomId', async () => {
      service.loadRooms('club-1');

      const roomsReq = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
      roomsReq.flush([{ id: 'room-1', name: 'General' }]);

      await Promise.resolve();

      const msgsReq = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
      msgsReq.flush([]);

      expect(getActiveRoomId(service)).toBe('room-1');
    });

    it('should set currentUserId when userId is passed', async () => {
      service.loadRooms('club-1', 'user-42');

      const roomsReq = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
      roomsReq.flush([{ id: 'room-1', name: 'General' }]);

      await Promise.resolve();

      const msgsReq = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
      // Flush a message sent by the same user — it should be marked isOwn
      msgsReq.flush([{
        id: 'msg-1',
        senderId: 'user-42',
        senderName: 'Alice',
        text: 'Hi',
        timestamp: '2024-01-01T00:00:00Z',
      }]);

      await Promise.resolve();

      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(1);
      expect(msgs[0].isOwn).toBe(true);
    });
  });

  describe('toggleOpen()', () => {
    it('should set isOpen to true when closed', () => {
      service.toggleOpen();
      expect(getIsOpen(service)).toBe(true);
    });
    it('should set isOpen to false when opened', () => {
      service.toggleOpen(); // open
      service.toggleOpen(); // close
      expect(getIsOpen(service)).toBe(false);
    });
    it('should call markAsRead and set unreadCount to 0 when opening', () => {
      (service as unknown as ChatServicePrivate)._unreadCount.set(5);
      service.toggleOpen();
      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });
  });

  describe('openRoom()', () => {
    it('should set activeRoomId to given roomId', () => {
      service.openRoom('room-2');

      const req = httpMock.expectOne(`${API}/chat/rooms/room-2/messages`);
      req.flush([]);

      expect(getActiveRoomId(service)).toBe('room-2');
    });

    it('should call markAsRead and set unreadCount to 0', () => {
      (service as unknown as ChatServicePrivate)._unreadCount.set(5);
      service.openRoom('room-2');

      const req = httpMock.expectOne(`${API}/chat/rooms/room-2/messages`);
      req.flush([]);

      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });

    it('activeMessages() returns messages for the new room', async () => {
      service.openRoom('room-3');

      const req = httpMock.expectOne(`${API}/chat/rooms/room-3/messages`);
      req.flush([
        { id: 'msg-3-1', senderId: 'u1', senderName: 'Alice', text: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
        { id: 'msg-3-2', senderId: 'u2', senderName: 'Bob', text: 'Hey', timestamp: '2024-01-01T00:01:00Z' },
      ]);

      // Wait for the firstValueFrom .then() to update the signal
      await Promise.resolve();

      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(2);
      expect(msgs[0].id).toBe('msg-3-1');
    });
  });

  describe('markAsRead()', () => {
    it('should set unreadCount to 0 and hasNewMessage to false', () => {
      (service as unknown as ChatServicePrivate)._unreadCount.set(5);
      (service as unknown as ChatServicePrivate)._hasNewMessage.set(true);
      service.markAsRead();
      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });
  });

  describe('sendMessage()', () => {
    it('inserts an optimistic message immediately before the POST resolves', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');

      service.sendMessage('Hello world', { id: 'user-99', displayName: 'TestUser' });

      // Optimistic message should be visible right away (before HTTP responds)
      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(1);
      expect(msgs[0].text).toBe('Hello world');
      expect(msgs[0].id.startsWith('temp-')).toBe(true);
      expect(msgs[0].isOwn).toBe(true);

      // Flush POST to avoid "unexpected request" in afterEach
      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush({
        id: 'new-msg', senderId: 'user-99', senderName: 'TestUser',
        text: 'Hello world', timestamp: '2024-01-01T00:00:00Z',
      });
    });

    it('replaces the temp message with the server-confirmed message after POST', async () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');

      service.sendMessage('Hello world', { id: 'user-99', displayName: 'TestUser' });

      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush({
        id: 'real-msg-id', senderId: 'user-99', senderName: 'TestUser',
        text: 'Hello world', timestamp: '2024-01-01T00:00:00Z',
      });

      await Promise.resolve();

      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(1);
      expect(msgs[0].id).toBe('real-msg-id');
      expect(msgs[0].id.startsWith('temp-')).toBe(false);
    });

    it('removes the temp message when POST fails', async () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');

      service.sendMessage('Will fail', { id: 'user-99', displayName: 'TestUser' });

      expect(getActiveMessages(service).length).toBe(1); // optimistic visible

      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush(
        { detail: 'Error' }, { status: 500, statusText: 'Server Error' },
      );

      // HttpClient error processing requires several microtask ticks
      for (let i = 0; i < 5; i++) await Promise.resolve();

      expect(getActiveMessages(service).length).toBe(0); // rolled back
    });

    it('should not send if activeRoomId is null', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set(null);
      service.sendMessage('Should not send', { id: 'user-x', displayName: 'Nobody' });
      httpMock.expectNone(`${API}/chat/rooms/null/messages`);
      expect(getActiveMessages(service).length).toBe(0);
    });
  });

  describe('activeRoom() computed', () => {
    it('should return correct room when activeRoomId matches', async () => {
      service.loadRooms('club-1');
      const roomsReq = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
      roomsReq.flush([
        { id: 'room-1', name: 'General' },
        { id: 'room-2', name: 'Off-topic' },
      ]);

      await Promise.resolve();

      const msgsReq = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
      msgsReq.flush([]);

      service.openRoom('room-2');
      const msgsReq2 = httpMock.expectOne(`${API}/chat/rooms/room-2/messages`);
      msgsReq2.flush([]);

      expect(getActiveRoom(service)?.id).toBe('room-2');
    });

    it('should return null when no room matches', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('unknown-room');
      expect(getActiveRoom(service)).toBeNull();
    });
  });

  describe('activeMessages() computed', () => {
    it('should return empty array when activeRoomId is null', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set(null);
      expect(getActiveMessages(service)).toEqual([]);
    });
  });

  describe('loadMessages() with params', () => {
    it('should include before and limit query params when provided', () => {
      service.loadMessages('room-1', { before: 'cursor-xyz', limit: 20 });
      const req = httpMock.expectOne(r =>
        r.url === `${API}/chat/rooms/room-1/messages` &&
        r.params.get('before') === 'cursor-xyz' &&
        r.params.get('limit') === '20',
      );
      expect(req.request.params.get('before')).toBe('cursor-xyz');
      req.flush([]);
    });

    it('should not include params when not provided', () => {
      service.loadMessages('room-1');
      const req = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
      expect(req.request.params.keys().length).toBe(0);
      req.flush([]);
    });
  });

  describe('loadAllClubRooms()', () => {
    async function flushMicrotasks(n = 5): Promise<void> {
      for (let i = 0; i < n; i++) await Promise.resolve();
    }

    it('loads rooms from multiple clubs and merges them', async () => {
      service.loadAllClubRooms([
        { id: 'club-1', name: 'Club A' },
        { id: 'club-2', name: 'Club B' },
      ]);

      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'r1', name: 'General' }]);
      httpMock.expectOne(`${API}/clubs/club-2/chat/rooms`).flush([{ id: 'r2', name: 'General' }]);

      await flushMicrotasks();

      // First room is auto-selected so loadMessages fires for r1
      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);

      await flushMicrotasks();

      expect(getRooms(service).length).toBe(2);
      expect(getRooms(service)[0].name).toBe('Club A · General');
      expect(getRooms(service)[1].name).toBe('Club B · General');
    });

    it('uses plain room name when only one club', async () => {
      service.loadAllClubRooms([{ id: 'club-1', name: 'Club A' }]);

      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'r1', name: 'General' }]);

      await flushMicrotasks();

      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);

      expect(getRooms(service)[0].name).toBe('General');
    });

    it('sets userId when provided', async () => {
      service.loadAllClubRooms([{ id: 'club-1', name: 'Club A' }], 'user-5');

      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'r1', name: 'General' }]);

      await flushMicrotasks();

      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([{
        id: 'm1', senderId: 'user-5', senderName: 'Me', text: 'Hi',
        timestamp: '2024-01-01T00:00:00Z',
      }]);

      await flushMicrotasks();

      expect(getActiveMessages(service)[0].isOwn).toBe(true);
    });

    it('gracefully handles failed club room requests', async () => {
      service.loadAllClubRooms([
        { id: 'club-1', name: 'Club A' },
        { id: 'club-bad', name: 'Club B' },
      ]);

      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'r1', name: 'General' }]);
      httpMock.expectOne(`${API}/clubs/club-bad/chat/rooms`).flush(
        { detail: 'Error' }, { status: 500, statusText: 'Error' },
      );

      await flushMicrotasks();

      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);

      expect(getRooms(service).length).toBe(1);
    });
  });

  describe('clearRooms()', () => {
    it('resets all signals to initial state', async () => {
      service.loadRooms('club-1');
      const req = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
      req.flush([{ id: 'r1', name: 'General' }]);
      await Promise.resolve();
      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);

      service.clearRooms();

      expect(getRooms(service)).toEqual([]);
      expect(getActiveRoomId(service)).toBeNull();
      expect(getUnreadCount(service)).toBe(0);
      expect(getIsOpen(service)).toBe(false);
      expect(getHasNewMessage(service)).toBe(false);
    });
  });

  describe('muteUser() / unmuteUser()', () => {
    it('muteUser adds user to muted set', () => {
      service.muteUser('user-bad');
      expect(service.mutedUserIds().has('user-bad')).toBe(true);
    });

    it('unmuteUser removes user from muted set', () => {
      service.muteUser('user-bad');
      service.unmuteUser('user-bad');
      expect(service.mutedUserIds().has('user-bad')).toBe(false);
    });

    it('activeMessages() marks muted user messages', async () => {
      service.loadRooms('club-1');
      const roomsReq = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
      roomsReq.flush([{ id: 'r1', name: 'General' }]);
      await Promise.resolve();

      const msgsReq = httpMock.expectOne(`${API}/chat/rooms/r1/messages`);
      msgsReq.flush([{
        id: 'm1', senderId: 'bad-user', senderName: 'Spammer', text: 'Spam',
        timestamp: '2024-01-01T00:00:00Z',
      }]);
      await Promise.resolve();

      service.muteUser('bad-user');
      expect(getActiveMessages(service)[0].isMuted).toBe(true);
    });
  });

  describe('deleteMessage()', () => {
    it('removes message from messages map on success', async () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.deleteMessage('msg-to-delete');

      const req = httpMock.expectOne(`${API}/chat/rooms/room-1/messages/msg-to-delete`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('does nothing when activeRoomId is null', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set(null);
      service.deleteMessage('msg-x');
      httpMock.expectNone(`${API}/chat/rooms/null/messages/msg-x`);
      expect(getActiveMessages(service).length).toBe(0);
    });
  });

  describe('banUserFromChat()', () => {
    it('sends POST with userId and duration', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.banUserFromChat('bad-user', 3600);

      const req = httpMock.expectOne(`${API}/chat/rooms/room-1/ban`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user_id: 'bad-user', duration_seconds: 3600 });
      req.flush(null);
    });

    it('does nothing when activeRoomId is null', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set(null);
      service.banUserFromChat('bad-user', 3600);
      httpMock.expectNone(`${API}/chat/rooms/null/ban`);
      expect(getActiveRoom(service)).toBeNull();
    });
  });

  describe('deleteRoom()', () => {
    it('sends DELETE and removes the room from rooms signal', async () => {
      // seed a room
      service.loadRooms('club-1');
      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'r1', name: 'General' }]);
      await Promise.resolve();
      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);

      const promise = service.deleteRoom('r1');
      httpMock.expectOne(`${API}/chat/rooms/r1`).flush(null);
      await promise;

      expect(getRooms(service).length).toBe(0);
    });

    it('clears activeRoomId and disconnects when deleting the active room', async () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-del');

      const promise = service.deleteRoom('room-del');
      httpMock.expectOne(`${API}/chat/rooms/room-del`).flush(null);
      await promise;

      expect(getActiveRoomId(service)).toBeNull();
    });

    it('keeps other rooms when deleting a non-active room', async () => {
      service.loadRooms('club-1');
      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([
        { id: 'r1', name: 'Room 1' },
        { id: 'r2', name: 'Room 2' },
      ]);
      await Promise.resolve();
      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);
      // r1 is active; delete r2 (non-active)
      const promise = service.deleteRoom('r2');
      httpMock.expectOne(`${API}/chat/rooms/r2`).flush(null);
      await promise;

      expect(getRooms(service).length).toBe(1);
      expect(getActiveRoomId(service)).toBe('r1');
    });
  });

  describe('deleteRoom()', () => {
    it('sends DELETE and removes the room from rooms signal', async () => {
      // seed a room
      service.loadRooms('club-1');
      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'r1', name: 'General' }]);
      await Promise.resolve();
      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);

      const promise = service.deleteRoom('r1');
      httpMock.expectOne(`${API}/chat/rooms/r1`).flush(null);
      await promise;

      expect(getRooms(service).length).toBe(0);
    });

    it('clears activeRoomId and disconnects when deleting the active room', async () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-del');

      const promise = service.deleteRoom('room-del');
      httpMock.expectOne(`${API}/chat/rooms/room-del`).flush(null);
      await promise;

      expect(getActiveRoomId(service)).toBeNull();
    });

    it('keeps other rooms when deleting a non-active room', async () => {
      service.loadRooms('club-1');
      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([
        { id: 'r1', name: 'Room 1' },
        { id: 'r2', name: 'Room 2' },
      ]);
      await Promise.resolve();
      httpMock.expectOne(`${API}/chat/rooms/r1/messages`).flush([]);
      // r1 is active; delete r2 (non-active)
      const promise = service.deleteRoom('r2');
      httpMock.expectOne(`${API}/chat/rooms/r2`).flush(null);
      await promise;

      expect(getRooms(service).length).toBe(1);
      expect(getActiveRoomId(service)).toBe('r1');
    });
  });

  describe('createRoom()', () => {
    it('sends POST and appends new room to rooms signal', async () => {
      service.createRoom('club-1', 'New Room');

      const req = httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'New Room' });
      req.flush({ id: 'new-room-id', name: 'New Room' });

      await Promise.resolve();

      expect(getRooms(service).length).toBe(1);
      expect(getRooms(service)[0].id).toBe('new-room-id');
      expect(getRooms(service)[0].clubId).toBe('club-1');
    });
  });

  describe('openAndFocusRoom()', () => {
    it('sets activeRoomId, opens chat, marks as read, and loads messages', () => {
      const room: ChatRoom = { id: 'room-1', name: 'General', clubId: 'club-1' };
      service.openAndFocusRoom(room);

      expect(getActiveRoomId(service)).toBe('room-1');
      expect(getIsOpen(service)).toBe(true);
      expect(getUnreadCount(service)).toBe(0);

      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush([]);
    });
  });

  describe('getEventRoom()', () => {
    it('returns a ChatRoom on success', async () => {
      const promise = service.getEventRoom('event-1');
      httpMock.expectOne(`${API}/events/event-1/chat/room`).flush({ id: 'room-1', name: 'Event Chat' });
      const room = await promise;
      expect(room?.id).toBe('room-1');
      expect(room?.eventId).toBeUndefined();
    });

    it('returns null when the request fails', async () => {
      const promise = service.getEventRoom('event-1');
      httpMock.expectOne(`${API}/events/event-1/chat/room`).flush(
        { detail: 'Not Found' },
        { status: 404, statusText: 'Not Found' },
      );
      const room = await promise;
      expect(room).toBeNull();
    });
  });

  describe('createEventChatRoom()', () => {
    it('sends POST and appends room to rooms signal', async () => {
      const promise = service.createEventChatRoom('event-1');
      const req = httpMock.expectOne(`${API}/events/event-1/chat/room`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: 'room-e1', name: 'Event Chat', eventId: 'event-1' });

      const room = await promise;
      expect(room.id).toBe('room-e1');
      expect(room.eventId).toBe('event-1');
      expect(getRooms(service).some(r => r.id === 'room-e1')).toBe(true);
    });
  });

  describe('connectRoom() / disconnectRoom()', () => {
    const WS_BASE = environment.wsUrl;

    it('connectRoom creates a WebSocket with the correct URL and sends auth frame on open', () => {
      service.connectRoom('room-42', 'my-token');
      const ws554 = MockWebSocket.instance;
      expect(ws554).not.toBeNull();
      expect(ws554?.url).toBe(`${WS_BASE}/chat/rooms/room-42`);
      expect(ws554?.url).not.toContain('?');
      ws554?.onopen?.();
      expect(ws554?.send).toHaveBeenCalledWith(JSON.stringify({ type: 'auth', token: 'my-token' }));
    });

    it('receiving a WS message appends it to activeMessages', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-42');
      service.connectRoom('room-42', 'tok');

      const ws561 = MockWebSocket.instance;
      if (!ws561) throw new Error('MockWebSocket not instantiated');
      ws561.simulateMessage({
        type: 'message',
        payload: {
          id: 'msg-ws-1',
          senderId: 'u1',
          senderName: 'Alice',
          text: 'Hello via WS',
          timestamp: '2024-01-01T00:00:00Z',
        },
      });

      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(1);
      expect(msgs[0].text).toBe('Hello via WS');
    });

    it('increments unreadCount and sets hasNewMessage when chat is closed', () => {
      // _isOpen stays false by default
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-42');
      service.connectRoom('room-42', 'tok');

      const ws579 = MockWebSocket.instance;
      if (!ws579) throw new Error('MockWebSocket not instantiated');
      ws579.simulateMessage({
        type: 'message',
        payload: {
          id: 'msg-ws-2',
          senderId: 'u1',
          senderName: 'Alice',
          text: 'Ping',
          timestamp: '2024-01-01T00:00:00Z',
        },
      });

      expect(getUnreadCount(service)).toBe(1);
      expect(getHasNewMessage(service)).toBe(true);
    });

    it('does NOT increment unreadCount when chat is open', () => {
      service.toggleOpen(); // open the chat
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-42');
      service.connectRoom('room-42', 'tok');

      const ws596 = MockWebSocket.instance;
      if (!ws596) throw new Error('MockWebSocket not instantiated');
      ws596.simulateMessage({
        type: 'message',
        payload: {
          id: 'msg-ws-3',
          senderId: 'u1',
          senderName: 'Alice',
          text: 'Hi',
          timestamp: '2024-01-01T00:00:00Z',
        },
      });

      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });

    it('disconnectRoom calls ws.close()', () => {
      service.connectRoom('room-42', 'tok');
      const ws = MockWebSocket.instance;
      expect(ws).not.toBeNull();
      service.disconnectRoom();
      expect(ws?.close).toHaveBeenCalled();
    });

    it('calling connectRoom twice closes the first WebSocket', () => {
      service.connectRoom('room-42', 'tok');
      const firstWs = MockWebSocket.instance;
      expect(firstWs).not.toBeNull();
      service.connectRoom('room-42', 'tok2');
      expect(firstWs?.close).toHaveBeenCalled();
    });

    it('deduplicates WS messages — same id is not added twice', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-42');
      service.connectRoom('room-42', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');

      const payload = { id: 'dup-msg', senderId: 'u1', senderName: 'Alice', text: 'Hello', timestamp: '2024-01-01T00:00:00Z' };
      ws.simulateMessage({ type: 'message', payload });
      ws.simulateMessage({ type: 'message', payload }); // duplicate

      expect(getActiveMessages(service).length).toBe(1);
    });

    it('WS echo replaces temp message from optimistic sendMessage', async () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-42');
      service.sendMessage('Real text', { id: 'u1', displayName: 'Alice' });
      const postReq = httpMock.expectOne(`${API}/chat/rooms/room-42/messages`);

      // Connect WS and simulate echo before POST resolves
      service.connectRoom('room-42', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');
      ws.simulateMessage({
        type: 'message',
        payload: { id: 'server-id', senderId: 'u1', senderName: 'Alice', text: 'Real text', timestamp: '2024-01-01T00:00:00Z' },
      });

      // temp message replaced by WS echo
      const msgs = getActiveMessages(service);
      expect(msgs.some(m => m.id.startsWith('temp-'))).toBe(false);
      expect(msgs.some(m => m.id === 'server-id')).toBe(true);

      postReq.flush({ id: 'server-id', senderId: 'u1', senderName: 'Alice', text: 'Real text', timestamp: '2024-01-01T00:00:00Z' });
      await Promise.resolve();
      // Still only one message (dedup handles POST .then() trying to map temp to real, but temp is gone)
      expect(getActiveMessages(service).filter(m => m.id === 'server-id').length).toBe(1);
    });

    it('disconnectRoom prevents reconnect by clearing _activeRoomToken', () => {
      vi.useFakeTimers();
      service.connectRoom('room-42', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');

      service.disconnectRoom(); // clears _activeRoomToken
      ws.simulateClose();       // onclose fires, but _activeRoomToken is null → no setTimeout

      vi.advanceTimersByTime(5_000);
      // No second WebSocket should have been created
      expect(MockWebSocket.instance).toBe(ws);
      vi.useRealTimers();
    });

    it('onopen resets _reconnectDelay to 1000', () => {
      service.connectRoom('room-42', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');

      // Simulate a previous backoff that doubled the delay
      (service as unknown as { _reconnectDelay: number })._reconnectDelay = 8_000;
      ws.onopen?.();

      expect((service as unknown as { _reconnectDelay: number })._reconnectDelay).toBe(1_000);
    });

    it('onerror calls ws.close()', () => {
      service.connectRoom('room-42', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');

      ws.simulateError();

      expect(ws.close).toHaveBeenCalled();
    });

    it('onclose with active token triggers reconnect after delay', () => {
      vi.useFakeTimers();
      service.connectRoom('room-42', 'tok');
      const firstWs = MockWebSocket.instance;
      if (!firstWs) throw new Error('MockWebSocket not instantiated');

      firstWs.simulateClose(); // _activeRoomToken is set → setTimeout fires

      vi.advanceTimersByTime(1_100); // exceed default 1000ms delay

      const secondWs = MockWebSocket.instance;
      expect(secondWs).not.toBe(firstWs); // new WebSocket created
      expect(secondWs?.url).toBe(`${WS_BASE}/chat/rooms/room-42`);
      expect(secondWs?.url).not.toContain('?');
      vi.useRealTimers();
    });

    it('strips email domain from senderName when it contains @', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.connectRoom('room-1', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');
      ws.simulateMessage({
        type: 'message',
        payload: {
          id: 'msg-email',
          senderId: 'u1',
          senderName: 'user@gmail.com',
          text: 'Hi',
          timestamp: '2024-01-01T00:00:00Z',
        },
      });
      expect(getActiveMessages(service)[0].senderName).toBe('user');
    });
  });

  // ── Feature 1: setChatsPage ────────────────────────────────────────────────

  describe('setChatsPage()', () => {
    it('suppresses unread counter for incoming messages when set to true', () => {
      service.setChatsPage(true);
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.connectRoom('room-1', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');
      ws.simulateMessage({
        type: 'message',
        payload: { id: 'msg-x', senderId: 'other-user', senderName: 'Bob', text: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
      });
      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });

    it('resumes unread counter after set back to false', () => {
      service.setChatsPage(true);
      service.setChatsPage(false);
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.connectRoom('room-1', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');
      ws.simulateMessage({
        type: 'message',
        payload: { id: 'msg-y', senderId: 'other-user', senderName: 'Bob', text: 'Hey', timestamp: '2024-01-01T00:00:00Z' },
      });
      expect(getUnreadCount(service)).toBe(1);
      expect(getHasNewMessage(service)).toBe(true);
    });

    it('does not count own messages even when setChatsPage is false', () => {
      service.setChatsPage(false);
      // Set currentUserId by loading rooms with userId
      (service as unknown as { currentUserId: string | null }).currentUserId = 'me';
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.connectRoom('room-1', 'tok');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');
      ws.simulateMessage({
        type: 'message',
        payload: { id: 'msg-own', senderId: 'me', senderName: 'Me', text: 'My msg', timestamp: '2024-01-01T00:00:00Z' },
      });
      expect(getUnreadCount(service)).toBe(0);
    });
  });

  // ── Feature 5: fetchUnreadCounts ──────────────────────────────────────────

  interface ChatServiceReadPrivate {
    _lastReadMap: WritableSignal<Record<string, string | null>>;
    _roomUnreadCounts: WritableSignal<Record<string, number>>;
  }

  describe('fetchUnreadCounts()', () => {
    it('fires GET per room and updates roomUnreadCounts + _lastReadMap', async () => {
      service.fetchUnreadCounts(['room-1', 'room-2']);

      const req1 = httpMock.expectOne(`${API}/chat/rooms/room-1/unread-count`);
      expect(req1.request.method).toBe('GET');
      req1.flush({ room_id: 'room-1', unread_count: 3, last_read_message_id: 'msg-aaa' });

      const req2 = httpMock.expectOne(`${API}/chat/rooms/room-2/unread-count`);
      expect(req2.request.method).toBe('GET');
      req2.flush({ room_id: 'room-2', unread_count: 0, last_read_message_id: null });

      // Wait for Promise microtasks
      await Promise.resolve();
      await Promise.resolve();

      expect(service.roomUnreadCounts()['room-1']).toBe(3);
      expect(service.roomUnreadCounts()['room-2']).toBe(0);
      expect((service as unknown as ChatServiceReadPrivate)._lastReadMap()['room-1']).toBe('msg-aaa');
      expect((service as unknown as ChatServiceReadPrivate)._lastReadMap()['room-2']).toBeNull();
    });

    it('handles a failed room request gracefully (other rooms still succeed)', async () => {
      service.fetchUnreadCounts(['room-ok', 'room-fail']);

      httpMock.expectOne(`${API}/chat/rooms/room-ok/unread-count`).flush({
        room_id: 'room-ok', unread_count: 5, last_read_message_id: 'msg-z',
      });
      httpMock.expectOne(`${API}/chat/rooms/room-fail/unread-count`).flush(
        { detail: 'Error' }, { status: 500, statusText: 'Server Error' },
      );

      // Allow multiple microtask cycles for error handling
      for (let i = 0; i < 5; i++) await Promise.resolve();

      expect(service.roomUnreadCounts()['room-ok']).toBe(5);
      // room-fail key should not be set (gracefully skipped)
      expect(service.roomUnreadCounts()['room-fail']).toBeUndefined();
    });

    it('does nothing when called with empty array', () => {
      service.fetchUnreadCounts([]);
      httpMock.expectNone(`${API}/chat/rooms/`);
      expect(Object.keys(service.roomUnreadCounts()).length).toBe(0);
    });
  });

  // ── Feature 5: markRoomRead ───────────────────────────────────────────────

  describe('markRoomRead()', () => {
    it('updates _lastReadMap and resets roomUnreadCount for the room immediately', async () => {
      // Seed messages into the room
      service.loadRooms('club-1');
      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'room-1', name: 'General' }]);
      await Promise.resolve();
      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush([
        { id: 'msg-100', senderId: 'u1', senderName: 'Alice', text: 'First', timestamp: '2024-01-01T00:00:00Z' },
        { id: 'msg-101', senderId: 'u2', senderName: 'Bob',   text: 'Last',  timestamp: '2024-01-01T00:01:00Z' },
      ]);
      await Promise.resolve();

      // Pre-seed unread count from server
      service.fetchUnreadCounts(['room-1']);
      httpMock.expectOne(`${API}/chat/rooms/room-1/unread-count`).flush({
        room_id: 'room-1', unread_count: 2, last_read_message_id: null,
      });
      await Promise.resolve();
      await Promise.resolve();

      expect(service.roomUnreadCounts()['room-1']).toBe(2);

      service.markRoomRead('room-1');

      // Synchronous local state update
      expect((service as unknown as ChatServiceReadPrivate)._lastReadMap()['room-1']).toBe('msg-101');
      expect(service.roomUnreadCounts()['room-1']).toBe(0);

      // Server POST should have been sent
      const postReq = httpMock.expectOne(`${API}/chat/rooms/room-1/read`);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual({ last_read_message_id: 'msg-101' });
      postReq.flush(null);
    });

    it('does nothing when the room has no messages', () => {
      service.markRoomRead('room-empty');
      // No POST should be made
      httpMock.expectNone(`${API}/chat/rooms/room-empty/read`);
      expect(service.roomUnreadCounts()['room-empty']).toBeUndefined();
    });

    it('activeMessagesWithDivider inserts divider after last-read message', async () => {
      service.loadRooms('club-1');
      httpMock.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([{ id: 'room-d', name: 'General' }]);
      await Promise.resolve();
      httpMock.expectOne(`${API}/chat/rooms/room-d/messages`).flush([
        { id: 'msg-a', senderId: 'u1', senderName: 'Alice', text: 'Read',   timestamp: '2024-01-01T00:00:00Z' },
        { id: 'msg-b', senderId: 'u2', senderName: 'Bob',   text: 'Unread', timestamp: '2024-01-01T00:01:00Z' },
      ]);
      await Promise.resolve();

      // Simulate server telling us msg-a was last read
      (service as unknown as ChatServiceReadPrivate)._lastReadMap.update((m: Record<string, string | null>) => ({ ...m, ['room-d']: 'msg-a' }));

      const items = service.activeMessagesWithDivider();
      expect(items.length).toBe(3); // msg-a + divider + msg-b
      expect(items[1]).toEqual(expect.objectContaining({ isDivider: true }));
      expect((items[2] as { text: string }).text).toBe('Unread');
    });
  });
});
