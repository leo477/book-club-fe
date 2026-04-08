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
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

      @if (isLoading()) {
        <!-- Skeleton loader -->
        <div class="max-w-4xl mx-auto px-4 py-8" aria-busy="true" aria-label="Loading club details">
          <div class="animate-pulse space-y-4">
            <div class="h-56 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      } @else if (errorMessage()) {
        <!-- Error state -->
        <div class="max-w-4xl mx-auto px-4 py-8 text-center" role="alert">
          <p class="text-6xl mb-4" aria-hidden="true">😕</p>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Club not found</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">{{ errorMessage() }}</p>
          <a
            routerLink="/clubs"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            ← Back to Clubs
          </a>
        </div>
      } @else if (club()) {
        <!-- Cover image -->
        <div class="relative">
          @if (club()!.coverUrl) {
            <img
              [src]="club()!.coverUrl"
              [alt]="'Cover image for ' + club()!.name"
              class="w-full h-56 object-cover"
            />
          } @else {
            <div class="bg-gradient-to-br from-primary-400 to-accent-500 h-56" aria-hidden="true"></div>
          }

          <!-- Back navigation overlay -->
          <div class="absolute top-4 left-4">
            <a
              routerLink="/clubs"
              class="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-white hover:bg-black/50 transition-colors"
              aria-label="Back to clubs list"
            >
              ← Back
            </a>
          </div>
        </div>

        <!-- Club content -->
        <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">

          <!-- Club header -->
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">
                  {{ club()!.name }}
                </h1>
                @if (!club()!.isPublic) {
                  <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                    🔒 Private
                  </span>
                }
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <span aria-hidden="true">👥</span>
                <span>{{ club()!.memberCount }} {{ club()!.memberCount === 1 ? 'member' : 'members' }}</span>
              </p>
            </div>

            <!-- Join / Leave button -->
            @if (currentUser()) {
              @if (!isOrganizer()) {
                @if (isMember()) {
                  <button
                    type="button"
                    (click)="onLeave()"
                    [disabled]="isActionLoading()"
                    class="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    aria-label="Leave this club"
                  >
                    @if (isActionLoading()) {
                      <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    }
                    Leave Club
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="onJoin()"
                    [disabled]="isActionLoading()"
                    class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    aria-label="Join this club"
                  >
                    @if (isActionLoading()) {
                      <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    }
                    Join Club
                  </button>
                }
              } @else {
                <span class="inline-flex items-center gap-1.5 rounded-xl bg-accent-100 dark:bg-accent-900/30 px-4 py-2.5 text-sm font-semibold text-accent-700 dark:text-accent-300">
                  ✨ Organizer
                </span>
              }
            }
          </div>

          <!-- Action error -->
          @if (actionError()) {
            <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{{ actionError() }}</span>
            </div>
          }

          <!-- Description -->
          @if (club()!.description) {
            <div class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
              <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">About</h2>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ club()!.description }}</p>
            </div>
          }

          <!-- Organizer manage panel -->
          @if (isOrganizer()) {
            <div class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
              <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Manage</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  [routerLink]="['/clubs', id(), 'quizzes']"
                  class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span class="text-xl" aria-hidden="true">📝</span>
                  <div>
                    <p class="font-semibold">Quizzes</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Create & manage reading quizzes</p>
                  </div>
                </a>
                <a
                  [routerLink]="['/clubs', id(), 'randomizer']"
                  class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span class="text-xl" aria-hidden="true">🎲</span>
                  <div>
                    <p class="font-semibold">Book Randomizer</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Pick the next book to read</p>
                  </div>
                </a>
              </div>
            </div>
          }

          <!-- Club meta -->
          <p class="text-xs text-gray-400 dark:text-gray-600 text-right">
            Created {{ formatDate(club()!.createdAt) }}
          </p>
        </div>
      }
    </div>
  `,
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
