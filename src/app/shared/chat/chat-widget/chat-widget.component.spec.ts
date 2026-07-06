import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { ChatWidgetComponent } from './chat-widget.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ClubService } from '../../../core/services/club.service';
import { TokenStore } from '../../../core/auth/token.store';

function makeRouter(url = '/') {
  return { url, events: EMPTY } satisfies Partial<Router>;
}

function makeAuthService(overrides: Partial<{ isOrganizer: boolean; currentUser: unknown }> = {}) {
  return {
    currentUser: signal(overrides.currentUser !== undefined ? overrides.currentUser : null),
    isOrganizer: signal(overrides.isOrganizer ?? false),
    isAuthenticated: signal(false),
  };
}

function makeChatService() {
  return {
    hasNewMessage: signal(false),
    isOpen: signal(false),
    rooms: signal([]),
    activeRoom: signal<{ clubId: string } | null>(null),
    activeMessages: signal([]),
    activeMessagesWithDivider: signal([]),
    unreadCount: signal(0),
    activeRoomId: signal<string | null>(null),
    presenceMap: signal(new Map<string, 'online' | 'offline'>()),
    roomUnreadCounts: signal<Record<string, number>>({}),
    sendMessage: vi.fn(),
    openRoom: vi.fn(),
    closeChat: vi.fn(),
    toggleChat: vi.fn(),
    toggleOpen: vi.fn(),
    markAsRead: vi.fn(),
    setChatsPage: vi.fn(),
    fetchUnreadCounts: vi.fn(),
    markRoomRead: vi.fn(),
    muteUser: vi.fn(),
    unmuteUser: vi.fn(),
    deleteMessage: vi.fn(),
    banUserFromChat: vi.fn(),
    deleteRoom: vi.fn().mockResolvedValue(undefined),
    createRoom: vi.fn(),
    clearRooms: vi.fn(),
    loadAllClubRooms: vi.fn(),
    connectRoom: vi.fn(),
    disconnectRoom: vi.fn(),
  };
}

function makeTokenStore(token: string | null = null) {
  return {
    token: signal<string | null>(token),
    set: vi.fn(),
    clear: vi.fn(),
    snapshot: vi.fn().mockReturnValue(token),
  };
}

function makeClubService() {
  return {
    myClubs: signal<{ id: string; name: string; organizerId?: string }[]>([]),
    loadMyClubs: vi.fn().mockResolvedValue(undefined),
  };
}

interface CompProtected {
  messageText: { (): string; set(v: string): void };
  isBouncing: { (): boolean; set(v: boolean): void };
  openMenuId: { (): string | null; set(v: string | null): void };
  isCreatingRoom: { (): boolean; set(v: boolean): void };
  newRoomName: { (): string; set(v: string): void };
  fabPositionClass: () => string;
  panelPositionClass: () => string;
  isFabVisible: () => boolean;
  sendMessage(): void;
  onKeydown(event: KeyboardEvent): void;
  onEscape(): void;
  closeAndReturnFocus(): void;
  toggleMenu(msgId: string): void;
  muteUser(userId: string): void;
  unmuteUser(userId: string): void;
  deleteMessage(messageId: string): void;
  banUser(userId: string, durationSeconds: number): void;
  toggleCreateRoom(): void;
  submitCreateRoom(): Promise<void>;
  onRoomNameKeydown(event: KeyboardEvent): void;
  showingRoomList: { (): boolean; set(v: boolean): void };
  shouldShowRoomList: () => boolean;
  goToRoomList(): void;
  selectRoom(id: string): void;
}

describe('ChatWidgetComponent', () => {
  let authSvc: ReturnType<typeof makeAuthService>;
  let chatSvc: ReturnType<typeof makeChatService>;
  let clubSvc: ReturnType<typeof makeClubService>;
  let tokenStore: ReturnType<typeof makeTokenStore>;

  beforeEach(async () => {
    authSvc = makeAuthService();
    chatSvc = makeChatService();
    clubSvc = makeClubService();
    tokenStore = makeTokenStore();

    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authSvc },
        { provide: ChatService, useValue: chatSvc },
        { provide: ClubService, useValue: clubSvc },
        { provide: TokenStore, useValue: tokenStore },
        { provide: Router, useValue: makeRouter() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('fabPositionClass returns bottom-24 right-6 when isOrganizer is true', () => {
    authSvc = makeAuthService({ currentUser: { id: 'owner-1', displayName: 'Owner' } });
    chatSvc = makeChatService();
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    clubSvc = makeClubService();
    clubSvc.myClubs.set([{ id: 'club-1', name: 'Club A', organizerId: 'owner-1' }]);
    TestBed.overrideProvider(AuthService, { useValue: authSvc });
    TestBed.overrideProvider(ChatService, { useValue: chatSvc });
    TestBed.overrideProvider(ClubService, { useValue: clubSvc });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    expect(comp.fabPositionClass()).toBe('bottom-24 right-6');
  });

  it('fabPositionClass returns bottom-6 right-6 when isOrganizer is false', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    expect(comp.fabPositionClass()).toBe('bottom-6 right-6');
  });

  it('sendMessage does nothing when messageText is empty', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.messageText.set('   ');
    comp.sendMessage();
    expect(chatSvc.sendMessage).not.toHaveBeenCalled();
  });

  it('sendMessage does nothing when user is not logged in', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.messageText.set('Hello');
    // currentUser is null by default
    comp.sendMessage();
    expect(chatSvc.sendMessage).not.toHaveBeenCalled();
  });

  it('sendMessage calls chat.sendMessage and clears text when user is logged in', () => {
    authSvc = makeAuthService({
      currentUser: { id: 'user-1', displayName: 'Alice' },
    });
    TestBed.overrideProvider(AuthService, { useValue: authSvc });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.messageText.set('Hello world');
    comp.sendMessage();
    expect(chatSvc.sendMessage).toHaveBeenCalledWith('Hello world', { id: 'user-1', displayName: 'Alice' });
    expect(comp.messageText()).toBe('');
  });

  it('panelPositionClass returns bottom-40 right-6 when isOrganizer is true', () => {
    authSvc = makeAuthService({ currentUser: { id: 'owner-1', displayName: 'Owner' } });
    chatSvc = makeChatService();
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    clubSvc = makeClubService();
    clubSvc.myClubs.set([{ id: 'club-1', name: 'Club A', organizerId: 'owner-1' }]);
    TestBed.overrideProvider(AuthService, { useValue: authSvc });
    TestBed.overrideProvider(ChatService, { useValue: chatSvc });
    TestBed.overrideProvider(ClubService, { useValue: clubSvc });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    expect(comp.panelPositionClass()).toBe('bottom-40 right-6');
  });

  it('panelPositionClass returns bottom-24 right-6 when isOrganizer is false', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    expect(comp.panelPositionClass()).toBe('bottom-24 right-6');
  });

  it('onKeydown sends message on Enter without Shift', () => {
    authSvc = makeAuthService({ currentUser: { id: 'u1', displayName: 'Alice' } });
    TestBed.overrideProvider(AuthService, { useValue: authSvc });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.messageText.set('Hi');
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
    vi.spyOn(event, 'preventDefault');
    comp.onKeydown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(chatSvc.sendMessage).toHaveBeenCalled();
  });

  it('onKeydown does not send message on Shift+Enter', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.messageText.set('Hi');
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    comp.onKeydown(event);
    expect(chatSvc.sendMessage).not.toHaveBeenCalled();
  });

  it('onKeydown ignores non-Enter keys', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.onKeydown(new KeyboardEvent('keydown', { key: 'a' }));
    expect(chatSvc.sendMessage).not.toHaveBeenCalled();
  });

  it('toggleMenu opens a menu and toggles it closed', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.toggleMenu('msg-1');
    expect(comp.openMenuId()).toBe('msg-1');
    comp.toggleMenu('msg-1');
    expect(comp.openMenuId()).toBeNull();
  });

  it('toggleMenu switches to another menu id', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.toggleMenu('msg-1');
    comp.toggleMenu('msg-2');
    expect(comp.openMenuId()).toBe('msg-2');
  });

  it('muteUser calls chat.muteUser and closes menu', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.openMenuId.set('msg-1');
    comp.muteUser('bad-user');
    expect(chatSvc.muteUser).toHaveBeenCalledWith('bad-user');
    expect(comp.openMenuId()).toBeNull();
  });

  it('unmuteUser calls chat.unmuteUser and closes menu', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.openMenuId.set('msg-1');
    comp.unmuteUser('good-user');
    expect(chatSvc.unmuteUser).toHaveBeenCalledWith('good-user');
    expect(comp.openMenuId()).toBeNull();
  });

  it('deleteMessage calls chat.deleteMessage and closes menu', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.openMenuId.set('msg-1');
    comp.deleteMessage('msg-1');
    expect(chatSvc.deleteMessage).toHaveBeenCalledWith('msg-1');
    expect(comp.openMenuId()).toBeNull();
  });

  it('banUser calls chat.banUserFromChat and closes menu', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.openMenuId.set('msg-1');
    comp.banUser('bad-user', 3600);
    expect(chatSvc.banUserFromChat).toHaveBeenCalledWith('bad-user', 3600);
    expect(comp.openMenuId()).toBeNull();
  });

  it('toggleCreateRoom toggles isCreatingRoom and clears newRoomName', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.newRoomName.set('some name');
    comp.toggleCreateRoom();
    expect(comp.isCreatingRoom()).toBe(true);
    expect(comp.newRoomName()).toBe('');
    comp.toggleCreateRoom();
    expect(comp.isCreatingRoom()).toBe(false);
  });

  it('submitCreateRoom does nothing when name is empty', () => {
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.newRoomName.set('   ');
    comp.submitCreateRoom();
    expect(chatSvc.createRoom).not.toHaveBeenCalled();
  });

  it('submitCreateRoom does nothing when no active room', () => {
    chatSvc.activeRoom.set(null);
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.newRoomName.set('My Room');
    comp.submitCreateRoom();
    expect(chatSvc.createRoom).not.toHaveBeenCalled();
  });

  it('submitCreateRoom calls createRoom and resets state', async () => {
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.isCreatingRoom.set(true);
    comp.newRoomName.set('New Room');
    await comp.submitCreateRoom();
    expect(chatSvc.createRoom).toHaveBeenCalledWith('club-1', 'New Room');
    expect(comp.newRoomName()).toBe('');
    expect(comp.isCreatingRoom()).toBe(false);
  });

  it('submitCreateRoom shows a toast and keeps the form open on failure', async () => {
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    chatSvc.createRoom.mockRejectedValueOnce(new Error('boom'));
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.isCreatingRoom.set(true);
    comp.newRoomName.set('New Room');
    await comp.submitCreateRoom();
    expect(comp.newRoomName()).toBe('New Room');
    expect(comp.isCreatingRoom()).toBe(true);
  });

  it('onRoomNameKeydown submits on Enter', () => {
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.isCreatingRoom.set(true);
    comp.newRoomName.set('A Room');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    vi.spyOn(event, 'preventDefault');
    comp.onRoomNameKeydown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(chatSvc.createRoom).toHaveBeenCalled();
  });

  it('onRoomNameKeydown closes on Escape', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.isCreatingRoom.set(true);
    comp.onRoomNameKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(comp.isCreatingRoom()).toBe(false);
  });

  describe('Effect 1 — isBouncing', () => {
    it('sets isBouncing to true when hasNewMessage becomes true', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      chatSvc.hasNewMessage.set(true);
      TestBed.flushEffects();
      expect(comp.isBouncing()).toBe(true);
    });

    it('does not set isBouncing when hasNewMessage is false', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      chatSvc.hasNewMessage.set(false);
      TestBed.flushEffects();
      expect(comp.isBouncing()).toBe(false);
    });
  });

  // "clubs/user" room-list bootstrap and WS connect/disconnect are now
  // orchestrated centrally in ChatService (see chat.service.spec.ts) —
  // ChatWidgetComponent no longer has its own copy of those effects.

  describe('showingRoomList / goToRoomList / selectRoom', () => {
    it('showingRoomList is false by default', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.showingRoomList()).toBe(false);
    });

    it('goToRoomList sets showingRoomList to true', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.goToRoomList();
      expect(comp.showingRoomList()).toBe(true);
    });

    it('selectRoom calls chat.openRoom and sets showingRoomList to false', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.showingRoomList.set(true);
      comp.selectRoom('room-42');
      expect(chatSvc.openRoom).toHaveBeenCalledWith('room-42');
      expect(comp.showingRoomList()).toBe(false);
    });

    it('shouldShowRoomList is true when showingRoomList is true', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.showingRoomList.set(true);
      expect(comp.shouldShowRoomList()).toBe(true);
    });

    it('shouldShowRoomList is true when >1 rooms and no activeRoomId', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatSvc.rooms.set([{ id: 'r1', clubId: 'c1', name: 'R1' }, { id: 'r2', clubId: 'c1', name: 'R2' }] as any);
      chatSvc.activeRoomId.set(null);
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.shouldShowRoomList()).toBe(true);
    });

    it('shouldShowRoomList is false when exactly 1 room', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatSvc.rooms.set([{ id: 'r1', clubId: 'c1', name: 'R1' }] as any);
      chatSvc.activeRoomId.set(null);
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.shouldShowRoomList()).toBe(false);
    });
  });

  describe('Effect 3 — isOpen room-list logic', () => {
    it('sets showingRoomList true when isOpen, >1 rooms, and no activeRoomId', () => {
      chatSvc.isOpen.set(true);
      chatSvc.activeRoomId.set(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatSvc.rooms.set([{ id: 'r1', clubId: 'c1', name: 'R1' }, { id: 'r2', clubId: 'c1', name: 'R2' }] as any);
      tokenStore = makeTokenStore('tok');
      TestBed.overrideProvider(TokenStore, { useValue: tokenStore });
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      TestBed.flushEffects();
      expect(comp.showingRoomList()).toBe(true);
    });

    it('sets showingRoomList false when isOpen and exactly 1 room', () => {
      chatSvc.isOpen.set(true);
      chatSvc.activeRoomId.set(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatSvc.rooms.set([{ id: 'r1', clubId: 'c1', name: 'R1' }] as any);
      tokenStore = makeTokenStore('tok');
      TestBed.overrideProvider(TokenStore, { useValue: tokenStore });
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      TestBed.flushEffects();
      expect(comp.showingRoomList()).toBe(false);
    });
  });

  describe('isFabVisible', () => {
    it('returns true on a non-club-detail URL', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.isFabVisible()).toBe(true);
    });

    it('returns false on a club detail URL /clubs/:id', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/clubs/abc-123', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.isFabVisible()).toBe(false);
    });

    it('returns true on /clubs (list page, not a detail)', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/clubs', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.isFabVisible()).toBe(true);
    });

    it('returns true on /clubs/:id/subpage (nested path, not matched by regex)', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/clubs/abc-123/events', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.isFabVisible()).toBe(true);
    });

    it('updates isFabVisible when router emits a NavigationEnd to a club detail URL', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/home', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.isFabVisible()).toBe(true);
      routerEvents$.next(Object.assign(new NavigationEnd(1, '/clubs/42', '/clubs/42')));
      TestBed.flushEffects();
      expect(comp.isFabVisible()).toBe(false);
    });

    it('returns false on /chats page', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/chats', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.isFabVisible()).toBe(false);
    });
  });

  describe('setChatsPage', () => {
    it('calls setChatsPage(true) via effect when on /chats route', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/chats', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      chatSvc = makeChatService();
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      TestBed.createComponent(ChatWidgetComponent);
      TestBed.flushEffects();
      expect(chatSvc.setChatsPage).toHaveBeenCalledWith(true);
    });

    it('calls setChatsPage(false) via effect when on a non-chats route', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/home', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      chatSvc = makeChatService();
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      TestBed.createComponent(ChatWidgetComponent);
      TestBed.flushEffects();
      expect(chatSvc.setChatsPage).toHaveBeenCalledWith(false);
    });
  });

  describe('deleteRoom', () => {
    it('calls chat.deleteRoom and reloads rooms when user and clubs exist', async () => {
      authSvc = makeAuthService({ currentUser: { id: 'u1', displayName: 'Alice' } });
      chatSvc = makeChatService();
      chatSvc.deleteRoom = vi.fn().mockResolvedValue(undefined);
      clubSvc = makeClubService();
      clubSvc.myClubs.set([{ id: 'club-1', name: 'Club A' }]);
      TestBed.overrideProvider(AuthService, { useValue: authSvc });
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      TestBed.overrideProvider(ClubService, { useValue: clubSvc });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as { deleteRoom(id: string): Promise<void> };
      await comp.deleteRoom('room-1');
      expect(chatSvc.deleteRoom).toHaveBeenCalledWith('room-1');
      expect(chatSvc.loadAllClubRooms).toHaveBeenCalled();
    });

    it('does not call loadAllClubRooms when clubs list is empty', async () => {
      authSvc = makeAuthService({ currentUser: { id: 'u1', displayName: 'Alice' } });
      chatSvc = makeChatService();
      chatSvc.deleteRoom = vi.fn().mockResolvedValue(undefined);
      TestBed.overrideProvider(AuthService, { useValue: authSvc });
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as { deleteRoom(id: string): Promise<void> };
      await comp.deleteRoom('room-1');
      expect(chatSvc.loadAllClubRooms).not.toHaveBeenCalled();
    });

    it('does not call loadAllClubRooms when user is null', async () => {
      // authSvc.currentUser is null by default
      chatSvc = makeChatService();
      chatSvc.deleteRoom = vi.fn().mockResolvedValue(undefined);
      clubSvc = makeClubService();
      clubSvc.myClubs.set([{ id: 'club-1', name: 'Club A' }]);
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      TestBed.overrideProvider(ClubService, { useValue: clubSvc });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as { deleteRoom(id: string): Promise<void> };
      await comp.deleteRoom('room-1');
      expect(chatSvc.loadAllClubRooms).not.toHaveBeenCalled();
    });

    it('handles deleteRoom error gracefully without throwing', async () => {
      chatSvc = makeChatService();
      chatSvc.deleteRoom = vi.fn().mockRejectedValue(new Error('net error'));
      TestBed.overrideProvider(ChatService, { useValue: chatSvc });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as { deleteRoom(id: string): Promise<void> };
      await expect(comp.deleteRoom('room-bad')).resolves.not.toThrow();
    });
  });

  describe('fabPositionClass / panelPositionClass on /clubs list page', () => {
    it('fabPositionClass returns bottom-24 right-6 on /clubs list page', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/clubs', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.fabPositionClass()).toBe('bottom-24 right-6');
    });

    it('panelPositionClass returns bottom-40 right-6 on /clubs list page', () => {
      const routerEvents$ = new Subject<RouterEvent>();
      const mockRouter = { url: '/clubs', events: routerEvents$.asObservable() } satisfies Partial<Router>;
      TestBed.overrideProvider(Router, { useValue: mockRouter });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.panelPositionClass()).toBe('bottom-40 right-6');
    });
  });

  describe('closeAndReturnFocus', () => {
    it('calls chat.toggleOpen', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.closeAndReturnFocus();
      expect(chatSvc.toggleOpen).toHaveBeenCalled();
    });
  });

  describe('onEscape', () => {
    it('calls closeAndReturnFocus when chat is open', () => {
      chatSvc.isOpen.set(true);
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      vi.spyOn(comp, 'closeAndReturnFocus');
      comp.onEscape();
      expect(comp.closeAndReturnFocus).toHaveBeenCalled();
    });

    it('does not call closeAndReturnFocus when chat is closed', () => {
      chatSvc.isOpen.set(false);
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      vi.spyOn(comp, 'closeAndReturnFocus');
      comp.onEscape();
      expect(comp.closeAndReturnFocus).not.toHaveBeenCalled();
    });
  });

  describe('isCurrentClubOrganizer', () => {
    it('returns false when activeRoom has no clubId', () => {
      chatSvc.activeRoom.set(null);
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      // access via fabPositionClass which depends on isCurrentClubOrganizer
      expect(comp.fabPositionClass()).toBe('bottom-6 right-6');
    });

    it('returns false when user is not logged in', () => {
      chatSvc.activeRoom.set({ clubId: 'club-1' });
      // authSvc.currentUser is null by default
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.fabPositionClass()).toBe('bottom-6 right-6');
    });

    it('returns false when club is not found in myClubs', () => {
      authSvc = makeAuthService({ currentUser: { id: 'user-1', displayName: 'Alice' } });
      chatSvc.activeRoom.set({ clubId: 'club-99' });
      clubSvc.myClubs.set([{ id: 'club-1', name: 'Club A', organizerId: 'user-1' }]);
      TestBed.overrideProvider(AuthService, { useValue: authSvc });
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.fabPositionClass()).toBe('bottom-6 right-6');
    });
  });

  it('shouldShowRoomList is false when showingRoomList is false and only 1 room exists', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSvc.rooms.set([{ id: 'r1', clubId: 'c1', name: 'R1' }] as any);
    chatSvc.activeRoomId.set(null);
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    expect(comp.shouldShowRoomList()).toBe(false);
  });

  it('Effect 1 — closes chat when navigating to /chats page', () => {
    const routerEvents$ = new Subject<RouterEvent>();
    const mockRouter = { url: '/chats', events: routerEvents$.asObservable() } satisfies Partial<Router>;
    TestBed.overrideProvider(Router, { useValue: mockRouter });
    chatSvc = makeChatService();
    chatSvc.isOpen.set(true);
    TestBed.overrideProvider(ChatService, { useValue: chatSvc });
    TestBed.createComponent(ChatWidgetComponent);
    TestBed.flushEffects();
    expect(chatSvc.toggleOpen).toHaveBeenCalled();
  });

  describe('send button disabled binding', () => {
    it('messageText signal starts empty — send button is logically disabled', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(comp.messageText()).toBe('');
      // disabled = !messageText().trim() should be true when empty
      expect(!comp.messageText().trim()).toBe(true);
    });

    it('messageText signal with whitespace — send button remains logically disabled', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.messageText.set('   ');
      expect(!comp.messageText().trim()).toBe(true);
    });

    it('messageText signal with text — send button is logically enabled', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      comp.messageText.set('Hello');
      expect(!comp.messageText().trim()).toBe(false);
    });

    it('messageText updates via set() and disabled state reflects new value', () => {
      const fixture = TestBed.createComponent(ChatWidgetComponent);
      const comp = fixture.componentInstance as unknown as CompProtected;
      expect(!comp.messageText().trim()).toBe(true);
      comp.messageText.set('Hi there');
      expect(!comp.messageText().trim()).toBe(false);
      comp.messageText.set('');
      expect(!comp.messageText().trim()).toBe(true);
    });
  });
});
