import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStore } from '../../core/auth/token.store';
import { ChatService } from '../../core/services/chat.service';
import { ClubService } from '../../core/services/club.service';
import { ChatRoom } from '../../core/models/chat.model';
import { ChatTimestampPipe } from '../../shared/pipes/chat-timestamp.pipe';
import { HlmButton } from '../../shared/spartan/button/src';
import { HlmInput } from '../../shared/spartan/input/src';

@Component({
  selector: 'app-chats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ChatTimestampPipe, FormsModule, HlmButton, HlmInput],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);
  private readonly clubService = inject(ClubService);
  private readonly tokenStore = inject(TokenStore);
  private readonly _destroyRef = inject(DestroyRef);

  @ViewChild('messagesList') private readonly messagesListRef?: ElementRef<HTMLElement>;

  protected readonly messageText = signal('');

  private _clubsLoadTriggered = false;
  /** Tracks the last room we scrolled to — prevents re-scroll on every new WS message. */
  private _lastScrolledRoomId: string | null = null;

  protected readonly roomsByClub = computed(() => {
    const clubs = this.clubService.myClubs();
    const clubMap = new Map(clubs.map(c => [c.id, c.name]));
    const grouped = new Map<string, ChatRoom[]>();
    for (const room of this.chat.rooms()) {
      const list = grouped.get(room.clubId) ?? [];
      list.push(room);
      grouped.set(room.clubId, list);
    }
    return Array.from(grouped.entries()).map(([clubId, rooms]) => ({
      clubId,
      clubName: clubMap.get(clubId) ?? clubId,
      rooms,
    }));
  });

  constructor() {
    // Feature 1: suppress FAB badge while the /chats page is mounted.
    this.chat.setChatsPage(true);
    this._destroyRef.onDestroy(() => this.chat.setChatsPage(false));

    effect(() => {
      const user = this.auth.currentUser();
      if (!user) {
        this._clubsLoadTriggered = false;
        this.chat.clearRooms();
        return;
      }

      const clubs = this.clubService.myClubs();
      if (clubs.length > 0) {
        this._clubsLoadTriggered = false;
        this.chat.loadAllClubRooms(clubs, user.id);
      } else if (!this._clubsLoadTriggered) {
        this._clubsLoadTriggered = true;
        this.clubService.loadMyClubs().catch(() => undefined);
      }
    });

    // Feature 5: fetch per-room unread counts once rooms are loaded.
    effect(() => {
      const rooms = this.chat.rooms();
      if (rooms.length > 0) {
        this.chat.fetchUnreadCounts(rooms.map(r => r.id));
      }
    });

    effect(() => {
      const roomId = this.chat.activeRoomId();
      const token = this.tokenStore.token();
      if (roomId && token) {
        this.chat.connectRoom(roomId, token);
      } else if (!roomId) {
        this.chat.disconnectRoom();
      }
    });

    // Feature 5: scroll to first unread message when a room is opened and
    // messages have loaded.  Runs once per room switch (tracked by _lastScrolledRoomId).
    effect(() => {
      const roomId = this.chat.activeRoomId();
      const msgs = this.chat.activeMessages();
      if (!roomId || msgs.length === 0 || this._lastScrolledRoomId === roomId) return;
      this._lastScrolledRoomId = roomId;
      setTimeout(() => {
        const container = this.messagesListRef?.nativeElement;
        if (!container) return;
        const divider = container.querySelector('[data-unread-divider]') as HTMLElement | null;
        if (divider) {
          divider.scrollIntoView({ block: 'start' });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }, 80);
    });
  }

  protected selectRoom(room: ChatRoom): void {
    // Feature 5: mark the current room as read before switching.
    const prevRoomId = this.chat.activeRoomId();
    if (prevRoomId && prevRoomId !== room.id) {
      this.chat.markRoomRead(prevRoomId);
    }
    // Reset scroll tracker so we'll scroll-to-unread in the new room.
    this._lastScrolledRoomId = null;
    this.chat.openRoom(room.id);
    this.chat.markAsRead();
  }

  protected sendMessage(): void {
    const text = this.messageText().trim();
    if (!text) return;
    const user = this.auth.currentUser();
    if (!user) return;
    this.chat.sendMessage(text, { id: user.id, displayName: user.displayName });
    this.messageText.set('');
    // Feature 5: sending a message implies we've read everything.
    const roomId = this.chat.activeRoomId();
    if (roomId) this.chat.markRoomRead(roomId);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Feature 5: returns true if the message at index i starts a new visual group
   * (first message overall, after a divider, or sender changed).
   */
  protected isMsgGroupFirst(i: number): boolean {
    const items = this.chat.activeMessagesWithDivider();
    if (i === 0) return true;
    const prev = items[i - 1];
    if ((prev as { isDivider?: boolean }).isDivider) return true;
    return (prev as { senderId: string }).senderId !== (items[i] as { senderId: string }).senderId;
  }

  /**
   * Feature 5: returns true if the message at index i ends a visual group
   * (last message overall, before a divider, or sender changed next).
   */
  protected isMsgGroupLast(i: number): boolean {
    const items = this.chat.activeMessagesWithDivider();
    if (i >= items.length - 1) return true;
    const next = items[i + 1];
    if ((next as { isDivider?: boolean }).isDivider) return true;
    return (next as { senderId: string }).senderId !== (items[i] as { senderId: string }).senderId;
  }
}
