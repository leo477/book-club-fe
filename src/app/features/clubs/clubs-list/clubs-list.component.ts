import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club } from '../../../core/models/club.model';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-clubs-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule],
  templateUrl: './clubs-list.component.html',
})
export class ClubsListComponent implements OnInit {
  readonly clubService = inject(ClubService);
  readonly auth = inject(AuthService);

  readonly joiningClubId = signal<string | null>(null);

  readonly cityKeys = computed(() => Object.keys(this.clubService.upcomingByCity()));
  readonly ownedClubIds = this.clubService.myOwnedClubIds;

  async ngOnInit(): Promise<void> {
    await this.clubService.loadPublicClubs();
    if (this.auth.isAuthenticated()) {
      await this.clubService.loadMyClubs();
    }
  }

  async onJoin(club: Club): Promise<void> {
    this.joiningClubId.set(club.id);
    try {
      await this.clubService.joinClub(club.id);
    } catch {
      // error handled in service
    } finally {
      this.joiningClubId.set(null);
    }
  }

  protected daysUntil(dateStr: string): number {
    const now = new Date();
    const meeting = new Date(dateStr);
    return Math.ceil((meeting.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  protected formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('uk-UA', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  }

  protected initials(displayName: string): string {
    return displayName
      .split(' ')
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
