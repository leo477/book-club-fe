import { Component, ChangeDetectionStrategy, inject, signal, effect, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenStore } from '../../../core/auth/token.store';
import { ChatService } from '../../../core/services/chat.service';
import { ClubService } from '../../../core/services/club.service';
import { ChatTimestampPipe } from '../../pipes/chat-timestamp.pipe';
import { HlmButton } from '../../spartan/button/src';
import { HlmInput } from '../../spartan/input/src';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, FormsModule, ChatTimestampPipe, HlmButton, HlmInput],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);
  private readonly clubService = inject(ClubService);
  private readonly tokenStore = inject(TokenStore);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly isChatsPage = computed(() => this.currentUrl().startsWith('/chats'));

  private readonly isClubsListPage = computed(() => this.currentUrl() === '/clubs');

  private readonly urlClubId = computed(() => {
    const match = /^\/clubs\/([^/]+)$/.exec(this.currentUrl());
    return match?.[1] ?? null;
  });

  /** Hide FAB on club detail pages (/clubs/:id) and when chat is already open */
  protected readonly isFabVisible = computed(() => {
    const url = this.currentUrl();
    const isClubDetail = /^\/clubs\/[^/]+$/.test(url);
    return !isClubDetail;
  });

  protected readonly messageText = signal('');
  protected readonly isBouncing = signal(false);
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly isCreatingRoom = signal(false);
  protected readonly newRoomName = signal('');

  protected readonly showingRoomList = signal(false);

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.chat.isOpen()) {
      this.closeAndReturnFocus();
    }
  }

  protected closeAndReturnFocus(): void {
    this.chat.toggleOpen();
    // Return focus to the FAB button after the panel closes
    setTimeout(() => {
      const fab = this.el.nativeElement.querySelector('.chat-fab') as HTMLElement | null;
      fab?.focus();
    }, 0);
  }

  protected readonly shouldShowRoomList = computed(() =>
    this.showingRoomList() || (this.chat.rooms().length > 1 && !this.chat.activeRoomId())
  );

  protected goToRoomList(): void {
    this.showingRoomList.set(true);
  }

  protected selectRoom(id: string): void {
    this.chat.openRoom(id);
    this.showingRoomList.set(false);
  }

  protected readonly isCurrentClubOrganizer = computed(() => {
    const clubId = this.chat.activeRoom()?.clubId ?? this.urlClubId();
    if (!clubId) return false;
    const userId = this.auth.currentUser()?.id;
    if (!userId) return false;
    const club = this.clubService.myClubs().find(c => c.id === clubId);
    return club?.organizerId === userId;
  });

  protected readonly fabPositionClass = computed(() => {
    const needsShift = this.isCurrentClubOrganizer() || this.isClubsListPage();
    return needsShift ? 'bottom-24 right-6' : 'bottom-6 right-6';
  });
  protected readonly panelPositionClass = computed(() => {
    const needsShift = this.isCurrentClubOrganizer() || this.isClubsListPage();
    return needsShift ? 'bottom-40 right-6' : 'bottom-24 right-6';
  });

  private _clubsLoadTriggered = false;

  constructor() {
    effect(() => {
      if (this.isChatsPage() && this.chat.isOpen()) {
        this.chat.toggleOpen();
      }
    });

    effect(() => {
      if (this.chat.hasNewMessage()) {
        this.isBouncing.set(true);
        setTimeout(() => this.isBouncing.set(false), 1000);
      }
    });

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

    effect(() => {
      const roomId = this.chat.activeRoomId();
      const token = this.tokenStore.token();
      if (roomId && token) {
        this.chat.connectRoom(roomId, token);
      } else if (!roomId) {
        this.chat.disconnectRoom();
      }

      if (this.chat.isOpen()) {
        const rooms = this.chat.rooms();
        if (rooms.length > 1 && !this.chat.activeRoomId()) {
          this.showingRoomList.set(true);
        } else if (rooms.length === 1) {
          this.showingRoomList.set(false);
        }
      }
    });
  }

  protected sendMessage(): void {
    const text = this.messageText().trim();
    if (!text) return;
    const user = this.auth.currentUser();
    if (!user) return;
    this.chat.sendMessage(text, { id: user.id, displayName: user.displayName });
    this.messageText.set('');
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  protected toggleMenu(msgId: string): void {
    this.openMenuId.update(id => (id === msgId ? null : msgId));
  }

  protected muteUser(userId: string): void {
    this.chat.muteUser(userId);
    this.openMenuId.set(null);
  }

  protected unmuteUser(userId: string): void {
    this.chat.unmuteUser(userId);
    this.openMenuId.set(null);
  }

  protected deleteMessage(messageId: string): void {
    this.chat.deleteMessage(messageId);
    this.openMenuId.set(null);
  }

  protected banUser(userId: string, durationSeconds: number): void {
    this.chat.banUserFromChat(userId, durationSeconds);
    this.openMenuId.set(null);
  }

  protected toggleCreateRoom(): void {
    this.isCreatingRoom.update(v => !v);
    this.newRoomName.set('');
  }

  protected submitCreateRoom(): void {
    const name = this.newRoomName().trim();
    const clubId = this.chat.activeRoom()?.clubId ?? this.urlClubId();
    if (!name || !clubId) return;
    this.chat.createRoom(clubId, name);
    this.newRoomName.set('');
    this.isCreatingRoom.set(false);
  }

  protected onRoomNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.submitCreateRoom(); }
    if (event.key === 'Escape') { this.isCreatingRoom.set(false); }
  }
}
