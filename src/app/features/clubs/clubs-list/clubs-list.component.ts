import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club } from '../../../core/models/club.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-clubs-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './clubs-list.component.html',
})
export class ClubsListComponent implements OnInit {
  readonly clubService = inject(ClubService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly joiningClubId = signal<string | null>(null);

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
      // Error already set in service; no extra handling needed here
    } finally {
      this.joiningClubId.set(null);
    }
  }
}
