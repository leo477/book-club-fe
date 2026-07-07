import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { TokenStore } from '../auth/token.store';
import { ClubService } from './club.service';
import { ChatSocket } from './chat-socket.service';

function makeAuthService(currentUser: { id: string } | null = null, getWsTicket$ = () => of<string | null>('tok')) {
  return { currentUser: signal(currentUser), getWsTicket$ };
}

function makeClubService(myClubs: { id: string; name: string }[] = []) {
  return { myClubs: signal(myClubs), loadMyClubs: vi.fn().mockResolvedValue(undefined) };
}

function makeTokenStore(token: string | null = 'tok') {
  return { token: signal(token) };
}

// ── MockWebSocket ─────────────────────────────────────────────────────────────

class MockWebSocket {
  static instance: MockWebSocket | null = null;
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  onopen: (() => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = MockWebSocket.CONNECTING;
  close = vi.fn(() => { this.readyState = MockWebSocket.CLOSED; });
  send = vi.fn();
  constructor(public url: string) { MockWebSocket.instance = this; }
  simulateMessage(data: object) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
  simulateClose() { this.readyState = MockWebSocket.CLOSED; this.onclose?.(); }
  simulateError() { this.onerror?.(); }
}

interface ChatServicePrivate {
  _hasNewMessage: WritableSignal<boolean>;
  _activeRoomId: WritableSignal<string | null>;
}

interface ChatServiceReadPrivate {
  _lastReadMap: WritableSignal<Record<string, string | null>>;
  _roomUnreadCounts: WritableSignal<Record<string, number>>;
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
  let tokenSignal: WritableSignal<string | null>;
  let wsTicket: string | null;

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

    tokenSignal = signal<string | null>('tok');
    wsTicket = 'tok';
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ChatService,
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: AuthService, useValue: makeAuthService(null, () => of(wsTicket)) },
        { provide: ClubService, useValue: makeClubService([]) },
        { provide: TokenStore, useValue: { token: tokenSignal } },
      ],
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
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
    it('clears the active room unread count and resets hasNewMessage when opening', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      (service as unknown as ChatServiceReadPrivate)._roomUnreadCounts.set({ 'room-1': 5 });
      (service as unknown as ChatServicePrivate)._hasNewMessage.set(true);
      service.toggleOpen();
      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });
    it('only resets hasNewMessage (no room counts to touch) when there is no active room', () => {
      (service as unknown as ChatServicePrivate)._hasNewMessage.set(true);
      service.toggleOpen();
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

    it('clears the unread count for the opened room and resets hasNewMessage', () => {
      (service as unknown as ChatServiceReadPrivate)._roomUnreadCounts.set({ 'room-2': 5 });
      (service as unknown as ChatServicePrivate)._hasNewMessage.set(true);
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
    it('resets hasNewMessage but does not touch any room unread counts (N-8)', () => {
      (service as unknown as ChatServiceReadPrivate)._roomUnreadCounts.set({ 'room-1': 5 });
      (service as unknown as ChatServicePrivate)._hasNewMessage.set(true);
      service.markAsRead();
      expect(getHasNewMessage(service)).toBe(false);
      expect(getUnreadCount(service)).toBe(5);
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

    it('maps isSystem from the API response onto the message model', async () => {
      service.loadMessages('room-1');
      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush([
        { id: 'm1', senderId: 'bot-1', senderName: 'Book Club Bot', text: 'Залишилось 2 дні', timestamp: '2024-01-01T00:00:00Z', isSystem: true },
        { id: 'm2', senderId: 'u1', senderName: 'Alice', text: 'hi', timestamp: '2024-01-01T00:01:00Z' },
      ]);
      await Promise.resolve();

      const messages = service.messages()['room-1'] ?? [];
      expect(messages.find(m => m.id === 'm1')?.isSystem).toBe(true);
      expect(messages.find(m => m.id === 'm2')?.isSystem).toBe(false);
    });
  });

  // ── N-7: loadOlderMessages ────────────────────────────────────────────────

  describe('loadOlderMessages()', () => {
    it('does nothing when the room has no messages loaded yet', async () => {
      await service.loadOlderMessages('room-empty');
      httpMock.expectNone(r => r.url.startsWith(`${API}/chat/rooms/room-empty/messages`));
    });

    it('prepends older messages without duplicating already-loaded ones', async () => {
      service.loadMessages('room-1');
      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush([
        { id: 'msg-10', senderId: 'u1', senderName: 'Alice', text: 'Ten', timestamp: '2024-01-01T00:10:00Z' },
        { id: 'msg-11', senderId: 'u2', senderName: 'Bob', text: 'Eleven', timestamp: '2024-01-01T00:11:00Z' },
      ]);
      await Promise.resolve();

      const promise = service.loadOlderMessages('room-1');
      const req = httpMock.expectOne(r =>
        r.url === `${API}/chat/rooms/room-1/messages` &&
        r.params.get('before') === 'msg-10',
      );
      // Includes msg-10 by accident (e.g. a race) to verify dedup
      req.flush([
        { id: 'msg-8', senderId: 'u1', senderName: 'Alice', text: 'Eight', timestamp: '2024-01-01T00:08:00Z' },
        { id: 'msg-9', senderId: 'u2', senderName: 'Bob', text: 'Nine', timestamp: '2024-01-01T00:09:00Z' },
        { id: 'msg-10', senderId: 'u1', senderName: 'Alice', text: 'Ten', timestamp: '2024-01-01T00:10:00Z' },
      ]);
      await promise;

      const msgs = service.messages()['room-1'];
      expect(msgs.map(m => m.id)).toEqual(['msg-8', 'msg-9', 'msg-10', 'msg-11']);
    });

    it('sets hasMoreOlder to false when the page comes back shorter than the limit', async () => {
      service.loadMessages('room-1');
      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush([
        { id: 'msg-10', senderId: 'u1', senderName: 'Alice', text: 'Ten', timestamp: '2024-01-01T00:10:00Z' },
      ]);
      await Promise.resolve();

      const promise = service.loadOlderMessages('room-1');
      const req = httpMock.expectOne(r => r.url === `${API}/chat/rooms/room-1/messages`);
      expect(req.request.params.get('limit')).toBe('50');
      // Fewer results than the page size → no more history
      req.flush([
        { id: 'msg-9', senderId: 'u1', senderName: 'Alice', text: 'Nine', timestamp: '2024-01-01T00:09:00Z' },
      ]);
      await promise;

      expect(service.hasMoreOlder()['room-1']).toBe(false);
    });

    it('does not fire a duplicate request while one is already in flight for that room', async () => {
      service.loadMessages('room-1');
      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush([
        { id: 'msg-10', senderId: 'u1', senderName: 'Alice', text: 'Ten', timestamp: '2024-01-01T00:10:00Z' },
      ]);
      await Promise.resolve();

      const first = service.loadOlderMessages('room-1');
      // Second call while the first is still in flight should not issue a new HTTP request
      const second = service.loadOlderMessages('room-1');

      const req = httpMock.expectOne(r => r.url === `${API}/chat/rooms/room-1/messages`);
      req.flush([{ id: 'msg-9', senderId: 'u1', senderName: 'Alice', text: 'Nine', timestamp: '2024-01-01T00:09:00Z' }]);

      await Promise.all([first, second]);

      httpMock.expectNone(r => r.url === `${API}/chat/rooms/room-1/messages` && r.params.get('before') != null && r.params.get('before') !== 'msg-10');
    });

    it('sets isLoadingOlder true while the request is in flight and false after', async () => {
      service.loadMessages('room-1');
      httpMock.expectOne(`${API}/chat/rooms/room-1/messages`).flush([
        { id: 'msg-10', senderId: 'u1', senderName: 'Alice', text: 'Ten', timestamp: '2024-01-01T00:10:00Z' },
      ]);
      await Promise.resolve();

      const promise = service.loadOlderMessages('room-1');
      expect(service.isLoadingOlder()['room-1']).toBe(true);

      httpMock.expectOne(r => r.url === `${API}/chat/rooms/room-1/messages`).flush([]);
      await promise;

      expect(service.isLoadingOlder()['room-1']).toBe(false);
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
    it('sets activeRoomId, opens chat, marks the room read, and loads messages', () => {
      (service as unknown as ChatServiceReadPrivate)._roomUnreadCounts.set({ 'room-1': 4 });
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

    it('upserts the event room into the rooms signal with the given clubId', async () => {
      const promise = service.getEventRoom('event-1', 'club-9');
      httpMock.expectOne(`${API}/events/event-1/chat/room`).flush({ id: 'room-1', name: 'Event Chat', eventId: 'event-1' });
      await promise;

      const room = getRooms(service).find(r => r.id === 'room-1');
      expect(room?.clubId).toBe('club-9');
      expect(room?.eventId).toBe('event-1');
    });

    it('does not duplicate the room if called twice for the same room id', async () => {
      const first = service.getEventRoom('event-1', 'club-9');
      httpMock.expectOne(`${API}/events/event-1/chat/room`).flush({ id: 'room-1', name: 'Event Chat', eventId: 'event-1' });
      await first;

      const second = service.getEventRoom('event-1', 'club-9');
      httpMock.expectOne(`${API}/events/event-1/chat/room`).flush({ id: 'room-1', name: 'Event Chat', eventId: 'event-1' });
      await second;

      expect(getRooms(service).filter(r => r.id === 'room-1')).toHaveLength(1);
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

    it('carries the given clubId onto the created room', async () => {
      const promise = service.createEventChatRoom('event-1', 'club-9');
      httpMock.expectOne(`${API}/events/event-1/chat/room`).flush({ id: 'room-e1', name: 'Event Chat', eventId: 'event-1' });
      const room = await promise;
      expect(room.clubId).toBe('club-9');
    });
  });

  describe('connectRoom() / disconnectRoom()', () => {
    const WS_BASE = environment.wsUrl;

    it('connectRoom creates a WebSocket with the correct URL and sends a ws-ticket auth frame on open', async () => {
      wsTicket = 'my-ticket';
      service.connectRoom('room-42');
      const ws554 = MockWebSocket.instance;
      expect(ws554).not.toBeNull();
      expect(ws554?.url).toBe(`${WS_BASE}/chat/rooms/room-42`);
      expect(ws554?.url).not.toContain('?');
      ws554?.onopen?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(ws554?.send).toHaveBeenCalledWith(JSON.stringify({ type: 'auth', ticket: 'my-ticket' }));
    });

    it('connectRoom fetches a fresh ticket at auth-frame time, not a connect-time snapshot', async () => {
      wsTicket = 'stale-ticket';
      service.connectRoom('room-42');
      const ws = MockWebSocket.instance;
      wsTicket = 'rotated-ticket';
      ws?.onopen?.();
      await Promise.resolve();
      await Promise.resolve();
      expect(ws?.send).toHaveBeenCalledWith(JSON.stringify({ type: 'auth', ticket: 'rotated-ticket' }));
    });

    it('receiving a WS message appends it to activeMessages', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-42');
      service.connectRoom('room-42');

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
      service.connectRoom('room-42');

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
      service.connectRoom('room-42');

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
      service.connectRoom('room-42');
      const ws = MockWebSocket.instance;
      expect(ws).not.toBeNull();
      service.disconnectRoom();
      expect(ws?.close).toHaveBeenCalled();
    });

    it('calling connectRoom twice for the same room does not close the first socket, even if the token changed', () => {
      service.connectRoom('room-42');
      const firstWs = MockWebSocket.instance;
      expect(firstWs).not.toBeNull();
      tokenSignal.set('tok2');
      service.connectRoom('room-42');
      expect(firstWs?.close).not.toHaveBeenCalled();
      expect(MockWebSocket.instance).toBe(firstWs);
    });

    it('is idempotent: re-connecting the same room/token while CONNECTING does not tear down the socket', () => {
      service.connectRoom('room-42');
      const firstWs = MockWebSocket.instance;
      expect(firstWs).not.toBeNull();
      // readyState stays CONNECTING (default); a re-run with the same token must no-op
      service.connectRoom('room-42');
      expect(firstWs?.close).not.toHaveBeenCalled();
      expect(MockWebSocket.instance).toBe(firstWs);
    });

    it('is idempotent while OPEN for the same room/token', () => {
      service.connectRoom('room-42');
      const firstWs = MockWebSocket.instance;
      if (!firstWs) throw new Error('MockWebSocket not instantiated');
      firstWs.readyState = MockWebSocket.OPEN;
      service.connectRoom('room-42');
      expect(firstWs.close).not.toHaveBeenCalled();
      expect(MockWebSocket.instance).toBe(firstWs);
    });

    it('reconnects when the room id changes', () => {
      service.connectRoom('room-42');
      const firstWs = MockWebSocket.instance;
      service.connectRoom('room-99');
      expect(firstWs?.close).toHaveBeenCalled();
      expect(MockWebSocket.instance?.url).toBe(`${WS_BASE}/chat/rooms/room-99`);
    });

    it('deduplicates WS messages — same id is not added twice', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-42');
      service.connectRoom('room-42');
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
      service.connectRoom('room-42');
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
      service.connectRoom('room-42');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');

      service.disconnectRoom(); // clears _activeRoomToken
      ws.simulateClose();       // onclose fires, but _activeRoomToken is null → no setTimeout

      vi.advanceTimersByTime(5_000);
      // No second WebSocket should have been created
      expect(MockWebSocket.instance).toBe(ws);
      vi.useRealTimers();
    });

    it('onopen resets the socket reconnect delay to 1000', () => {
      service.connectRoom('room-42');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');

      const socket = TestBed.inject(ChatSocket);
      // Simulate a previous backoff that doubled the delay
      (socket as unknown as { _reconnectDelay: number })._reconnectDelay = 8_000;
      ws.onopen?.();

      expect((socket as unknown as { _reconnectDelay: number })._reconnectDelay).toBe(1_000);
    });

    it('onerror calls ws.close()', () => {
      service.connectRoom('room-42');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');

      ws.simulateError();

      expect(ws.close).toHaveBeenCalled();
    });

    it('onclose with active token triggers reconnect after delay', () => {
      vi.useFakeTimers();
      service.connectRoom('room-42');
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

    it('disconnects the reconnected socket when the ws-ticket is gone by reconnect time (e.g. logout)', async () => {
      vi.useFakeTimers();
      service.connectRoom('room-42');
      const firstWs = MockWebSocket.instance;
      if (!firstWs) throw new Error('MockWebSocket not instantiated');

      wsTicket = null;
      firstWs.simulateClose();
      await vi.advanceTimersByTimeAsync(1_100);

      const secondWs = MockWebSocket.instance;
      expect(secondWs).not.toBe(firstWs);
      secondWs?.onopen?.();
      await vi.advanceTimersByTimeAsync(0);
      expect(secondWs?.close).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('strips email domain from senderName when it contains @', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.connectRoom('room-1');
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

    it('falls back to an empty senderName instead of throwing when all sender-name fields are missing', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.connectRoom('room-1');
      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');
      expect(() => ws.simulateMessage({
        type: 'message',
        payload: {
          id: 'msg-no-name',
          senderId: 'u1',
          text: 'Hi',
          timestamp: '2024-01-01T00:00:00Z',
        },
      })).not.toThrow();
      expect(getActiveMessages(service)[0].senderName).toBe('');
    });
  });

  // ── N-8: unreadCount is a single source of truth derived from roomUnreadCounts ──

  describe('unreadCount (N-8 consolidation)', () => {
    it('is the sum of all per-room unread counts', () => {
      (service as unknown as ChatServiceReadPrivate)._roomUnreadCounts.set({ 'room-1': 2, 'room-2': 3 });
      expect(getUnreadCount(service)).toBe(5);
    });

    it('a WS message increments only the count for the room it arrived in', () => {
      (service as unknown as ChatServiceReadPrivate)._roomUnreadCounts.set({ 'room-1': 1 });
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-2');
      service.connectRoom('room-2');

      const ws = MockWebSocket.instance;
      if (!ws) throw new Error('MockWebSocket not instantiated');
      ws.simulateMessage({
        type: 'message',
        payload: { id: 'msg-new', senderId: 'other-user', senderName: 'Bob', text: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
      });

      expect(service.roomUnreadCounts()['room-1']).toBe(1);
      expect(service.roomUnreadCounts()['room-2']).toBe(1);
      expect(getUnreadCount(service)).toBe(2);
    });

    it('has no standalone global counter left to disagree with roomUnreadCounts', () => {
      expect((service as unknown as Record<string, unknown>)['_unreadCount']).toBeUndefined();
    });
  });

  // ── Feature 1: setChatsPage ────────────────────────────────────────────────

  describe('setChatsPage()', () => {
    it('suppresses unread counter for incoming messages when set to true', () => {
      service.setChatsPage(true);
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-1');
      service.connectRoom('room-1');
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
      service.connectRoom('room-1');
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
      service.connectRoom('room-1');
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

    it('clears the local unread count but skips the server call when the room has no messages', () => {
      (service as unknown as ChatServiceReadPrivate)._roomUnreadCounts.set({ 'room-empty': 3 });
      service.markRoomRead('room-empty');
      // No POST should be made — we don't know the last-read message yet
      httpMock.expectNone(`${API}/chat/rooms/room-empty/read`);
      expect(service.roomUnreadCounts()['room-empty']).toBe(0);
    });

    it('does not POST when the last message id is an optimistic temp id', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set('room-temp');
      service.sendMessage('Pending', { id: 'u1', displayName: 'Alice' });
      // Optimistic message has a temp- id and the POST is still in flight
      const sendReq = httpMock.expectOne(`${API}/chat/rooms/room-temp/messages`);

      service.markRoomRead('room-temp');

      // local state still updates, but no read call with a temp id
      httpMock.expectNone(`${API}/chat/rooms/room-temp/read`);
      expect(service.roomUnreadCounts()['room-temp']).toBe(0);

      // flush the message POST to keep httpMock.verify() happy
      sendReq.flush({ id: 'real-id', senderId: 'u1', senderName: 'Alice', text: 'Pending', timestamp: '2024-01-01T00:00:00Z' });
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

// ── A-1: single orchestrator for room-list bootstrap + WS connect ───────────
// Previously duplicated as component effects in ChatWidgetComponent and
// ChatsComponent; now owned centrally by ChatService's constructor.
describe('ChatService — constructor orchestrator effects', () => {
  function setup(overrides: {
    user?: { id: string } | null;
    clubs?: { id: string; name: string }[];
    activeRoomId?: string | null;
    token?: string | null;
  } = {}) {
    const authSvc = makeAuthService(overrides.user ?? null);
    const clubSvc = makeClubService(overrides.clubs ?? []);
    const tokenStore = makeTokenStore(overrides.token ?? null);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ChatService,
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: AuthService, useValue: authSvc },
        { provide: ClubService, useValue: clubSvc },
        { provide: TokenStore, useValue: tokenStore },
      ],
    });
    const svc = TestBed.inject(ChatService);
    if (overrides.activeRoomId !== undefined) {
      (svc as unknown as ChatServicePrivate)._activeRoomId.set(overrides.activeRoomId);
    }
    TestBed.flushEffects();
    return { svc, http: TestBed.inject(HttpTestingController), authSvc, clubSvc, tokenStore };
  }

  it('loads all club rooms when the user has clubs', () => {
    const { http } = setup({ user: { id: 'u1' }, clubs: [{ id: 'club-1', name: 'Club A' }] });
    http.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([]);
    http.verify();
  });

  it('calls loadMyClubs when the user exists but has no clubs cached yet', () => {
    const { clubSvc, http } = setup({ user: { id: 'u1' }, clubs: [] });
    expect(clubSvc.loadMyClubs).toHaveBeenCalled();
    http.verify();
  });

  it('clears rooms when the user signs out', () => {
    const { svc, authSvc, http } = setup({ user: { id: 'u1' }, clubs: [{ id: 'club-1', name: 'Club A' }] });
    http.expectOne(`${API}/clubs/club-1/chat/rooms`).flush([]);
    authSvc.currentUser.set(null);
    TestBed.flushEffects();
    expect(getRooms(svc)).toEqual([]);
    http.verify();
  });

  it('connects the WS socket when there is an active room and a token', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).WebSocket = MockWebSocket;
    MockWebSocket.instance = null;
    // A signed-out user (default) makes the clubs-bootstrap effect call
    // clearRooms(), which would reset activeRoomId back to null — sign a
    // user in with no clubs so that effect is a no-op here.
    const { http } = setup({ user: { id: 'u1' }, clubs: [], activeRoomId: 'room-1', token: 'tok-abc' });
    const ws = MockWebSocket.instance as MockWebSocket | null;
    expect(ws?.url).toBe(`${environment.wsUrl}/chat/rooms/room-1`);
    http.verify();
  });

  it('does not connect when there is no token', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).WebSocket = MockWebSocket;
    MockWebSocket.instance = null;
    const { http } = setup({ user: { id: 'u1' }, clubs: [], activeRoomId: 'room-1', token: null });
    const ws = MockWebSocket.instance as MockWebSocket | null;
    expect(ws).toBeNull();
    http.verify();
  });
});
