import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChatWidgetComponent } from './chat-widget.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatService } from '../../../core/services/chat.service';

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
    activeRoom: signal(null),
    activeMessages: signal([]),
    unreadCount: signal(0),
    sendMessage: jasmine.createSpy('sendMessage'),
    openRoom: jasmine.createSpy('openRoom'),
    closeChat: jasmine.createSpy('closeChat'),
    toggleChat: jasmine.createSpy('toggleChat'),
    markAsRead: jasmine.createSpy('markAsRead'),
  };
}

interface CompProtected {
  messageText: { (): string; set(v: string): void };
  isBouncing: { (): boolean; set(v: boolean): void };
  fabPositionClass: () => string;
  panelPositionClass: () => string;
  sendMessage(): void;
  onKeydown(event: KeyboardEvent): void;
}

describe('ChatWidgetComponent', () => {
  let authSvc: ReturnType<typeof makeAuthService>;
  let chatSvc: ReturnType<typeof makeChatService>;

  beforeEach(async () => {
    authSvc = makeAuthService();
    chatSvc = makeChatService();

    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authSvc },
        { provide: ChatService, useValue: chatSvc },
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
});
