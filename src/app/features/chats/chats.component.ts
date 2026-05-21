import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStore } from '../../core/auth/token.store';
import { ChatService } from '../../core/services/chat.service';
import { ClubService } from '../../core/services/club.service';
import { ChatRoom } from '../../core/models/chat.model';
import { HlmButton } from '../../shared/spartan/button/src';
import { HlmInput } from '../../shared/spartan/input/src';

@Component({
  selector: 'app-chats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DatePipe, FormsModule, HlmButton, HlmInput],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);
  private readonly clubService = inject(ClubService);
  private readonly tokenStore = inject(TokenStore);

  protected readonly messageText = signal('');

  private _clubsLoadTriggered = false;

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
    });
  }

  protected selectRoom(room: ChatRoom): void {
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
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
