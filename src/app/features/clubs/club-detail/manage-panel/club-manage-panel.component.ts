import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HlmCard } from '../../../../shared/spartan/card/src';
import { HlmButton } from '../../../../shared/spartan/button/src';
import { ChatService } from '../../../../core/services/chat.service';
import { ClubService } from '../../../../core/services/club.service';

@Component({
  selector: 'app-club-manage-panel',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, TranslateModule, HlmCard, HlmButton],
  templateUrl: './club-manage-panel.component.html',
})
export class ClubManagePanelComponent {
  readonly clubId = input.required<string>();

  private readonly chatService = inject(ChatService);
  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router);

  readonly newRoomName = signal('');
  readonly isCreatingRoom = signal(false);
  readonly roomError = signal<string | null>(null);
  readonly isDeleting = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly deleteError = signal<string | null>(null);

  async createChatRoom(): Promise<void> {
    const name = this.newRoomName().trim();
    if (!name) return;
    this.isCreatingRoom.set(true);
    this.roomError.set(null);
    try {
      const room = await this.chatService.createRoom(this.clubId(), name);
      this.newRoomName.set('');
      this.chatService.openAndFocusRoom(room);
    } catch {
      this.roomError.set('Failed to create chat room');
    } finally {
      this.isCreatingRoom.set(false);
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteError.set(null);
  }

  async confirmDelete(): Promise<void> {
    this.isDeleting.set(true);
    this.deleteError.set(null);
    try {
      await this.clubService.deleteClub(this.clubId());
      await this.router.navigate(['/clubs']);
    } catch {
      this.isDeleting.set(false);
      this.deleteError.set('CLUB_DETAIL.delete_club_error');
    }
  }
}
