import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
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
  private readonly _destroyRef = inject(DestroyRef);

  private readonly messagesListRef = viewChild<ElementRef<HTMLElement>>('messagesList');

  protected readonly messageText = signal('');

  /** Tracks the last room we scrolled to — prevents re-scroll on every new WS message. */
  private _lastScrolledRoomId: string | null = null;
  /** Room ids we've already requested unread counts for — avoids an N+1 refetch
   *  of every room's unread-count on each `rooms()` change (e.g. `_upsertRoom`). */
  private readonly _unreadCountsFetchedFor = new Set<string>();

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

    // Room-list load and WS connection are orchestrated centrally in
    // ChatService (see its constructor) — previously duplicated here and in
    // ChatWidgetComponent, which caused a double GET /clubs/{id}/chat/rooms
    // whenever this page mounted alongside the globally-mounted widget.

    // Feature 5: fetch per-room unread counts once rooms are loaded. Only the
    // rooms we haven't already requested — `rooms()` also changes on
    // `_upsertRoom` (e.g. opening an event chat), which would otherwise
    // refetch every already-known room's unread count (N+1 on each change).
    effect(() => {
      const rooms = this.chat.rooms();
      const newRoomIds = rooms
        .map(r => r.id)
        .filter(id => !this._unreadCountsFetchedFor.has(id));
      if (newRoomIds.length > 0) {
        for (const id of newRoomIds) this._unreadCountsFetchedFor.add(id);
        this.chat.fetchUnreadCounts(newRoomIds);
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
        const container = this.messagesListRef()?.nativeElement;
        if (!container) return;
        const divider = container.querySelector('[data-unread-divider]') as HTMLElement | null;
        if (divider) {
          divider.scrollIntoView({ block: 'start', behavior: 'smooth' });
          setTimeout(() => { container.scrollTop -= 68; }, 200);
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

}
