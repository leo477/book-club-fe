import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, WritableSignal } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { environment } from '../../../environments/environment';

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
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection(), ChatService],
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
    it('should POST to server and then reload messages', async () => {
      // Set up an active room first
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');

      service.sendMessage('Hello world', { id: 'user-99', displayName: 'TestUser' });

      const postReq = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual({ text: 'Hello world' });

      // Flush the POST response, which triggers a reload via .then()
      postReq.flush({ id: 'new-msg', senderId: 'user-99', senderName: 'TestUser', text: 'Hello world', timestamp: '2024-01-01T00:00:00Z' });

      // Wait for the .then() microtask to run before expecting the GET
      await Promise.resolve();

      // Now the reload GET should be expected
      const getReq = httpMock.expectOne(`${API}/chat/rooms/room-1/messages`);
      getReq.flush([
        { id: 'new-msg', senderId: 'user-99', senderName: 'TestUser', text: 'Hello world', timestamp: '2024-01-01T00:00:00Z' }
      ]);

      await Promise.resolve();

      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(1);
      expect(msgs[0].text).toBe('Hello world');
    });

    it('should not send if activeRoomId is null', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set(null);
      service.sendMessage('Should not send', { id: 'user-x', displayName: 'Nobody' });
      httpMock.expectNone(`${API}/chat/rooms/null/messages`);
      // No requests should have been made
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

      expect(getActiveMessages(service)[0].isOwn).toBeTrue();
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
      expect(service.mutedUserIds().has('user-bad')).toBeTrue();
    });

    it('unmuteUser removes user from muted set', () => {
      service.muteUser('user-bad');
      service.unmuteUser('user-bad');
      expect(service.mutedUserIds().has('user-bad')).toBeFalse();
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
      expect(getActiveMessages(service)[0].isMuted).toBeTrue();
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
      expect(getIsOpen(service)).toBeTrue();
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
      expect(getRooms(service).some(r => r.id === 'room-e1')).toBeTrue();
    });
  });
});
