import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubService } from '../../core/services/club.service';
import { AuthService } from '../../core/auth/auth.service';
import { Club, ClubStats } from '../../core/models/club.model';
import { HlmSpinner } from '../../shared/spartan/spinner/src';
import { HlmButton } from '../../shared/spartan/button/src';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, HlmSpinner, HlmButton, EmptyStateComponent],
  templateUrl: './organizer-dashboard.component.html',
})
export class OrganizerDashboardComponent implements OnInit {
  private readonly clubService = inject(ClubService);
  protected readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deletingClubId = signal<string | null>(null);
  readonly confirmDeleteId = signal<string | null>(null);
  readonly expandedClubId = signal<string | null>(null);
  readonly clubStats = signal<Record<string, ClubStats | null>>({});

  readonly ownedClubs = this.clubService.myOwnedClubs;

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.clubService.loadPublicClubs(),
        this.clubService.loadMyClubs(),
      ]);
    } catch {
      this.error.set('Failed to load clubs');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleStats(clubId: string): void {
    if (this.expandedClubId() === clubId) {
      this.expandedClubId.set(null);
      return;
    }
    this.expandedClubId.set(clubId);
    if (this.clubStats()[clubId] !== undefined) return;
    this.clubStats.update(s => ({ ...s, [clubId]: null })); // null = loading
    this.http.get<ClubStats>(`${environment.apiUrl}/clubs/${clubId}/stats`).subscribe(stats => {
      this.clubStats.update(s => ({ ...s, [clubId]: stats }));
    });
  }

  confirmDelete(clubId: string): void {
    this.confirmDeleteId.set(clubId);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  async onDelete(club: Club): Promise<void> {
    this.deletingClubId.set(club.id);
    this.confirmDeleteId.set(null);
    try {
      await this.clubService.deleteClub(club.id);
    } catch {
      this.error.set('Failed to delete club');
    } finally {
      this.deletingClubId.set(null);
    }
  }
}
