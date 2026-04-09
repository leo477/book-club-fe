import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, WritableSignal } from '@angular/core';
import { ChatService } from './chat.service';
import { ChatMessage, ChatRoom } from '../models/chat.model';

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

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), ChatService] });
    jasmine.clock().install();
    service = TestBed.inject(ChatService);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('Initial state', () => {
    it('should have 3 rooms', () => {
      expect(getRooms(service).length).toBe(3);
    });
    it('should have activeRoomId as "room-1"', () => {
      expect(getActiveRoomId(service)).toBe('room-1');
    });
    it('should have unreadCount 2', () => {
      expect(getUnreadCount(service)).toBe(2);
    });
    it('should have isOpen false', () => {
      expect(getIsOpen(service)).toBe(false);
    });
    it('should have hasNewMessage false', () => {
      expect(getHasNewMessage(service)).toBe(false);
    });
    it('activeRoom() should return room-1', () => {
      expect(getActiveRoom(service)?.id).toBe('room-1');
    });
    it('activeMessages() should return messages for room-1', () => {
      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(3);
      expect(msgs[0].id).toBe('msg-1-1');
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
      service.toggleOpen();
      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });
  });

  describe('openRoom()', () => {
    it('should set activeRoomId to given roomId', () => {
      service.openRoom('room-2');
      expect(getActiveRoomId(service)).toBe('room-2');
    });
    it('should call markAsRead and set unreadCount to 0', () => {
      service.openRoom('room-2');
      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });
    it('activeMessages() returns messages for the new room', () => {
      service.openRoom('room-3');
      const msgs = getActiveMessages(service);
      expect(msgs.length).toBe(3);
      expect(msgs[0].id).toBe('msg-3-1');
    });
  });

  describe('markAsRead()', () => {
    it('should set unreadCount to 0 and hasNewMessage to false', () => {
      // Simulate unread state
      (service as unknown as ChatServicePrivate)._unreadCount.set(5);
      (service as unknown as ChatServicePrivate)._hasNewMessage.set(true);
      service.markAsRead();
      expect(getUnreadCount(service)).toBe(0);
      expect(getHasNewMessage(service)).toBe(false);
    });
  });

  describe('sendMessage()', () => {
    it('should append a new message to active room', () => {
      const before = getActiveMessages(service).length;
      service.sendMessage('Hello world', { id: 'user-99', displayName: 'TestUser' });
      const after = getActiveMessages(service);
      expect(after.length).toBe(before + 1);
      expect(after[after.length - 1].text).toBe('Hello world');
    });
    it('should set isOwn true and correct sender info', () => {
      service.sendMessage('Test msg', { id: 'user-42', displayName: 'QA' });
      const msg = getActiveMessages(service).at(-1)!;
      expect(msg.isOwn).toBe(true);
      expect(msg.senderId).toBe('user-42');
      expect(msg.senderName).toBe('QA');
    });
    it('should not add message if activeRoomId is null', () => {
      (service as unknown as ChatServicePrivate)._activeRoomId.set(null);
      const before = getActiveMessages(service).length;
      service.sendMessage('Should not send', { id: 'user-x', displayName: 'Nobody' });
      const after = getActiveMessages(service).length;
      expect(after).toBe(before);
    });
  });

  describe('activeRoom() computed', () => {
    it('should return correct room when activeRoomId matches', () => {
      service.openRoom('room-2');
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

  describe('simulateIncomingMessage()', () => {
    it('should increase unreadCount and set hasNewMessage after 4000ms', () => {
      const before = getUnreadCount(service);
      jasmine.clock().tick(4001);
      expect(getUnreadCount(service)).toBe(before + 1);
      expect(getHasNewMessage(service)).toBe(true);
      // The message should be appended to room-1
      const msgs = getActiveMessages(service);
      expect(msgs.at(-1)?.text).toContain('Привіт усім');
    });
  });
});
