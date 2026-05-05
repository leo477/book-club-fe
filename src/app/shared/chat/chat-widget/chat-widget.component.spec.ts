import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChatWidgetComponent } from './chat-widget.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ClubService } from '../../../core/services/club.service';

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
    unreadCount: signal(0),
    sendMessage: jasmine.createSpy('sendMessage'),
    openRoom: jasmine.createSpy('openRoom'),
    closeChat: jasmine.createSpy('closeChat'),
    toggleChat: jasmine.createSpy('toggleChat'),
    markAsRead: jasmine.createSpy('markAsRead'),
    muteUser: jasmine.createSpy('muteUser'),
    unmuteUser: jasmine.createSpy('unmuteUser'),
    deleteMessage: jasmine.createSpy('deleteMessage'),
    banUserFromChat: jasmine.createSpy('banUserFromChat'),
    createRoom: jasmine.createSpy('createRoom'),
    clearRooms: jasmine.createSpy('clearRooms'),
    loadAllClubRooms: jasmine.createSpy('loadAllClubRooms'),
  };
}

function makeClubService() {
  return {
    myClubs: signal<{ id: string; name: string }[]>([]),
    loadMyClubs: jasmine.createSpy('loadMyClubs').and.returnValue(Promise.resolve()),
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
  sendMessage(): void;
  onKeydown(event: KeyboardEvent): void;
  toggleMenu(msgId: string): void;
  muteUser(userId: string): void;
  unmuteUser(userId: string): void;
  deleteMessage(messageId: string): void;
  banUser(userId: string, durationSeconds: number): void;
  toggleCreateRoom(): void;
  submitCreateRoom(): void;
  onRoomNameKeydown(event: KeyboardEvent): void;
}

describe('ChatWidgetComponent', () => {
  let authSvc: ReturnType<typeof makeAuthService>;
  let chatSvc: ReturnType<typeof makeChatService>;
  let clubSvc: ReturnType<typeof makeClubService>;

  beforeEach(async () => {
    authSvc = makeAuthService();
    chatSvc = makeChatService();
    clubSvc = makeClubService();

    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authSvc },
        { provide: ChatService, useValue: chatSvc },
        { provide: ClubService, useValue: clubSvc },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('fabPositionClass returns bottom-24 right-6 when isOrganizer is true', () => {
    authSvc = makeAuthService({ isOrganizer: true });
    TestBed.overrideProvider(AuthService, { useValue: authSvc });
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
    authSvc = makeAuthService({ isOrganizer: true });
    TestBed.overrideProvider(AuthService, { useValue: authSvc });
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
    spyOn(event, 'preventDefault');
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
    expect(comp.isCreatingRoom()).toBeTrue();
    expect(comp.newRoomName()).toBe('');
    comp.toggleCreateRoom();
    expect(comp.isCreatingRoom()).toBeFalse();
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

  it('submitCreateRoom calls createRoom and resets state', () => {
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.isCreatingRoom.set(true);
    comp.newRoomName.set('New Room');
    comp.submitCreateRoom();
    expect(chatSvc.createRoom).toHaveBeenCalledWith('club-1', 'New Room');
    expect(comp.newRoomName()).toBe('');
    expect(comp.isCreatingRoom()).toBeFalse();
  });

  it('onRoomNameKeydown submits on Enter', () => {
    chatSvc.activeRoom.set({ clubId: 'club-1' });
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.isCreatingRoom.set(true);
    comp.newRoomName.set('A Room');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    comp.onRoomNameKeydown(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(chatSvc.createRoom).toHaveBeenCalled();
  });

  it('onRoomNameKeydown closes on Escape', () => {
    const fixture = TestBed.createComponent(ChatWidgetComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.isCreatingRoom.set(true);
    comp.onRoomNameKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(comp.isCreatingRoom()).toBeFalse();
  });
});
