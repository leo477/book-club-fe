import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ChatsComponent } from './chats.component';
import { AuthService } from '../../core/auth/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { ClubService } from '../../core/services/club.service';
import { ChatRoom } from '../../core/models/chat.model';

function makeAuthService(currentUser: { id: string; displayName: string } | null = null) {
  return { currentUser: signal(currentUser) };
}

function makeClubService(myClubs: { id: string; name: string }[] = []) {
  return { myClubs: signal(myClubs) };
}

function makeChatService() {
  return {
    rooms: signal<ChatRoom[]>([]),
    activeRoomId: signal<string | null>(null),
    activeRoom: signal<ChatRoom | null>(null),
    activeMessages: signal<{ id: string }[]>([]),
    activeMessagesWithDivider: signal<unknown[]>([]),
    roomUnreadCounts: signal<Record<string, number>>({}),
    presenceMap: signal(new Map<string, 'online' | 'offline'>()),
    setChatsPage: vi.fn(),
    fetchUnreadCounts: vi.fn(),
    markRoomRead: vi.fn(),
    markAsRead: vi.fn(),
    openRoom: vi.fn(),
    sendMessage: vi.fn(),
  };
}

interface CompProtected {
  messageText: { (): string; set(v: string): void };
  roomsByClub: () => { clubId: string; clubName: string; rooms: ChatRoom[] }[];
  selectRoom(room: ChatRoom): void;
  sendMessage(): void;
  onKeydown(event: KeyboardEvent): void;
}

describe('ChatsComponent', () => {
  let authSvc: ReturnType<typeof makeAuthService>;
  let clubSvc: ReturnType<typeof makeClubService>;
  let chatSvc: ReturnType<typeof makeChatService>;

  beforeEach(() => {
    authSvc = makeAuthService();
    clubSvc = makeClubService();
    chatSvc = makeChatService();

    TestBed.configureTestingModule({
      imports: [ChatsComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authSvc },
        { provide: ClubService, useValue: clubSvc },
        { provide: ChatService, useValue: chatSvc },
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ChatsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls setChatsPage(true) on construction and setChatsPage(false) on destroy', () => {
    const fixture = TestBed.createComponent(ChatsComponent);
    expect(chatSvc.setChatsPage).toHaveBeenCalledWith(true);
    fixture.destroy();
    expect(chatSvc.setChatsPage).toHaveBeenCalledWith(false);
  });

  describe('roomsByClub', () => {
    it('groups rooms by clubId and resolves club names', () => {
      clubSvc = makeClubService([{ id: 'c1', name: 'Club One' }]);
      TestBed.overrideProvider(ClubService, { useValue: clubSvc });
      chatSvc.rooms.set([
        { id: 'r1', name: 'General', clubId: 'c1' },
        { id: 'r2', name: 'Off-topic', clubId: 'c1' },
      ]);
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      const grouped = comp.roomsByClub();
      expect(grouped).toHaveLength(1);
      expect(grouped[0].clubName).toBe('Club One');
      expect(grouped[0].rooms).toHaveLength(2);
    });

    it('falls back to the clubId as name when the club is not in myClubs', () => {
      chatSvc.rooms.set([{ id: 'r1', name: 'General', clubId: 'unknown-club' }]);
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.roomsByClub()[0].clubName).toBe('unknown-club');
    });
  });

  describe('selectRoom', () => {
    it('marks the previous room read and opens the new room (which marks itself read)', () => {
      chatSvc.activeRoomId.set('room-prev');
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;

      comp.selectRoom({ id: 'room-next', name: 'Next', clubId: 'c1' });

      expect(chatSvc.markRoomRead).toHaveBeenCalledWith('room-prev');
      expect(chatSvc.openRoom).toHaveBeenCalledWith('room-next');
      // N-8: openRoom() now marks the newly-active room read and resets the
      // pulse internally — chats.component no longer needs a separate call.
      expect(chatSvc.markAsRead).not.toHaveBeenCalled();
    });

    it('does not mark previous room read when selecting the already-active room', () => {
      chatSvc.activeRoomId.set('room-1');
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;

      comp.selectRoom({ id: 'room-1', name: 'Room 1', clubId: 'c1' });

      expect(chatSvc.markRoomRead).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('does nothing when messageText is empty', () => {
      authSvc = makeAuthService({ id: 'u1', displayName: 'Alice' });
      TestBed.overrideProvider(AuthService, { useValue: authSvc });
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;

      comp.sendMessage();

      expect(chatSvc.sendMessage).not.toHaveBeenCalled();
    });

    it('does nothing when the user is not logged in', () => {
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.messageText.set('Hello');

      comp.sendMessage();

      expect(chatSvc.sendMessage).not.toHaveBeenCalled();
    });

    it('sends the message, clears the input, and marks the active room read', () => {
      authSvc = makeAuthService({ id: 'u1', displayName: 'Alice' });
      TestBed.overrideProvider(AuthService, { useValue: authSvc });
      chatSvc.activeRoomId.set('room-1');
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.messageText.set('Hello world');

      comp.sendMessage();

      expect(chatSvc.sendMessage).toHaveBeenCalledWith('Hello world', { id: 'u1', displayName: 'Alice' });
      expect(comp.messageText()).toBe('');
      expect(chatSvc.markRoomRead).toHaveBeenCalledWith('room-1');
    });
  });

  describe('onKeydown', () => {
    it('sends the message on Enter without Shift', () => {
      authSvc = makeAuthService({ id: 'u1', displayName: 'Alice' });
      TestBed.overrideProvider(AuthService, { useValue: authSvc });
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.messageText.set('Hi');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      vi.spyOn(event, 'preventDefault');

      comp.onKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(chatSvc.sendMessage).toHaveBeenCalled();
    });

    it('does not send on Shift+Enter', () => {
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });

      comp.onKeydown(event);

      expect(chatSvc.sendMessage).not.toHaveBeenCalled();
    });

    it('ignores non-Enter keys', () => {
      const fixture = TestBed.createComponent(ChatsComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      const event = new KeyboardEvent('keydown', { key: 'a' });

      comp.onKeydown(event);

      expect(chatSvc.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('unread counts effect', () => {
    it('fetches unread counts for newly-seen rooms only once', () => {
      const fixture = TestBed.createComponent(ChatsComponent);
      chatSvc.rooms.set([{ id: 'r1', name: 'Room 1', clubId: 'c1' }]);
      fixture.detectChanges();

      expect(chatSvc.fetchUnreadCounts).toHaveBeenCalledWith(['r1']);

      chatSvc.fetchUnreadCounts.mockClear();
      // Same room set again (e.g. _upsertRoom on an unrelated room) — no refetch for r1.
      chatSvc.rooms.set([
        { id: 'r1', name: 'Room 1', clubId: 'c1' },
        { id: 'r2', name: 'Room 2', clubId: 'c1' },
      ]);
      fixture.detectChanges();

      expect(chatSvc.fetchUnreadCounts).toHaveBeenCalledWith(['r2']);
    });
  });
});
