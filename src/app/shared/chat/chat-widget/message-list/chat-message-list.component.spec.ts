import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ChatMessageListComponent } from './chat-message-list.component';
import { ChatService } from '../../../../core/services/chat.service';

function makeChatService() {
  return {
    activeRoom: signal<{ id: string; clubId: string } | null>(null),
    activeRoomId: signal<string | null>(null),
    rooms: signal<{ id: string }[]>([]),
    activeMessages: signal<unknown[]>([]),
    activeMessagesWithDivider: signal<unknown[]>([]),
    isLoadingOlder: signal<Record<string, boolean>>({}),
    hasMoreOlder: signal<Record<string, boolean>>({}),
    presenceMap: signal(new Map<string, 'online' | 'offline'>()),
    loadOlderMessages: vi.fn().mockResolvedValue(undefined),
  };
}

describe('ChatMessageListComponent', () => {
  let chatSvc: ReturnType<typeof makeChatService>;

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [ChatMessageListComponent],
      providers: [provideTranslateService(), 
        provideZonelessChangeDetection(),
        { provide: ChatService, useValue: chatSvc },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ChatMessageListComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    chatSvc = makeChatService();
  });

  it('creates component', async () => {
    const fixture = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('onMessagesScroll', () => {
    it('does nothing when there is no active room', async () => {
      const fixture = await setup();
      const comp = fixture.componentInstance as unknown as { onMessagesScroll(): void };
      comp.onMessagesScroll();
      expect(chatSvc.loadOlderMessages).not.toHaveBeenCalled();
    });

    it('loads older messages when scrolled near the top', async () => {
      chatSvc.activeRoomId.set('room-1');
      const fixture = await setup();
      const el: HTMLElement = fixture.nativeElement.querySelector('.messages-scroll');
      Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
      const comp = fixture.componentInstance as unknown as { onMessagesScroll(): void };
      comp.onMessagesScroll();
      expect(chatSvc.loadOlderMessages).toHaveBeenCalledWith('room-1');

      // Flush loadOlderMessages().then(...) microtask, then the requestAnimationFrame
      // callback that writes el.scrollTop, so the write isn't left as an unhandled/
      // uninspected async side effect after the test completes.
      await Promise.resolve();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });

    it('does not load older messages when already loading', async () => {
      chatSvc.activeRoomId.set('room-1');
      chatSvc.isLoadingOlder.set({ 'room-1': true });
      const fixture = await setup();
      const el: HTMLElement = fixture.nativeElement.querySelector('.messages-scroll');
      Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
      const comp = fixture.componentInstance as unknown as { onMessagesScroll(): void };
      comp.onMessagesScroll();
      expect(chatSvc.loadOlderMessages).not.toHaveBeenCalled();
    });

    it('does not load older messages when there are no more', async () => {
      chatSvc.activeRoomId.set('room-1');
      chatSvc.hasMoreOlder.set({ 'room-1': false });
      const fixture = await setup();
      const el: HTMLElement = fixture.nativeElement.querySelector('.messages-scroll');
      Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
      const comp = fixture.componentInstance as unknown as { onMessagesScroll(): void };
      comp.onMessagesScroll();
      expect(chatSvc.loadOlderMessages).not.toHaveBeenCalled();
    });

    it('does not load older messages when scrolled far from the top', async () => {
      chatSvc.activeRoomId.set('room-1');
      const fixture = await setup();
      const el: HTMLElement = fixture.nativeElement.querySelector('.messages-scroll');
      Object.defineProperty(el, 'scrollTop', { value: 200, configurable: true, writable: true });
      const comp = fixture.componentInstance as unknown as { onMessagesScroll(): void };
      comp.onMessagesScroll();
      expect(chatSvc.loadOlderMessages).not.toHaveBeenCalled();
    });
  });
});
