import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club } from '../../../core/models/club.model';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent {
  /** Route parameter bound via withComponentInputBinding() */
  readonly id = input.required<string>();

  private readonly clubService = inject(ClubService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  readonly club = signal<Club | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly isMember = computed(() => this.clubService.myClubIds().has(this.id()));
  readonly isOrganizer = computed(
    () => this.club()?.organizerId === this.auth.currentUser()?.id,
  );

  constructor() {
    // React to route param changes (handles navigation between detail pages)
    effect(() => {
      const clubId = this.id();
      void this.loadClub(clubId);
    });
  }

  private async loadClub(clubId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Ensure membership data is available for isMember computed
      if (this.auth.isAuthenticated() && this.clubService.myClubs().length === 0) {
        await this.clubService.loadMyClubs();
      }

      const found = await this.clubService.getClubById(clubId);
      if (!found) {
        this.errorMessage.set('This club could not be found.');
      } else {
        this.club.set(found);
      }
    } catch {
      this.errorMessage.set('Failed to load club details.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onJoin(): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await this.clubService.joinClub(this.id());
      // Refresh club to get updated member count
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Failed to join club');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async onLeave(): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await this.clubService.leaveClub(this.id());
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Failed to leave club');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
