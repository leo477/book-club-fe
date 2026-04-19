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
});
