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
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

      <!-- ── Hero / Search bar ────────────────────────────────────────── -->
      <div class="bg-gradient-to-br from-primary-600 to-accent-600 px-4 py-12 text-center">
        <h1 class="font-display text-4xl font-bold text-white mb-2">Book Clubs</h1>
        <p class="text-primary-100 mb-8">Discover communities of readers like you</p>

        <!-- Search -->
        <div class="mx-auto max-w-xl relative">
          <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            🔍
          </span>
          <label for="club-search" class="sr-only">Search clubs</label>
          <input
            id="club-search"
            type="search"
            [ngModel]="clubService.searchQuery()"
            (ngModelChange)="clubService.setSearchQuery($event)"
            placeholder="Search by name or description…"
            class="w-full rounded-full shadow-sm bg-white dark:bg-gray-800 pl-10 pr-5 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Search clubs"
          />
        </div>
      </div>

      <!-- ── Page body ─────────────────────────────────────────────────── -->
      <div class="max-w-6xl mx-auto px-4 py-8 space-y-10">

        <!-- Global error -->
        @if (clubService.error()) {
          <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{{ clubService.error() }}</span>
          </div>
        }

        <!-- ── My Clubs (authenticated only) ──────────────────────────── -->
        @if (auth.isAuthenticated() && clubService.myClubs().length > 0) {
          <section aria-labelledby="my-clubs-heading">
            <h2 id="my-clubs-heading" class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span aria-hidden="true">📖</span> My Clubs
            </h2>
            <ul class="space-y-3" role="list">
              @for (club of clubService.myClubs(); track club.id) {
                <li>
                  <a
                    [routerLink]="['/clubs', club.id]"
                    class="flex items-center gap-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm px-5 py-4 hover:shadow-md transition-shadow group"
                    [attr.aria-label]="'Go to ' + club.name"
                  >
                    <!-- Thumbnail -->
                    @if (club.coverUrl) {
                      <img
                        [src]="club.coverUrl"
                        [alt]="''"
                        class="h-12 w-12 rounded-xl object-cover shrink-0"
                        aria-hidden="true"
                      />
                    } @else {
                      <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 shrink-0" aria-hidden="true"></div>
                    }
                    <!-- Info -->
                    <div class="min-w-0 flex-1">
                      <p class="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {{ club.name }}
                      </p>
                      @if (club.description) {
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ club.description }}</p>
                      }
                    </div>
                    <!-- Member count -->
                    <span class="shrink-0 rounded-full bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300">
                      {{ club.memberCount }} {{ club.memberCount === 1 ? 'member' : 'members' }}
                    </span>
                    <!-- Organizer badge -->
                    @if (club.organizerId === auth.currentUser()?.id) {
                      <span class="shrink-0 rounded-full bg-accent-100 dark:bg-accent-900/30 px-2.5 py-0.5 text-xs font-medium text-accent-700 dark:text-accent-300">
                        Organizer
                      </span>
                    }
                  </a>
                </li>
              }
            </ul>
          </section>
        }

        <!-- ── Discover Clubs ──────────────────────────────────────────── -->
        <section aria-labelledby="discover-heading">
          <div class="flex items-center justify-between mb-6">
            <h2 id="discover-heading" class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span aria-hidden="true">🌍</span> Discover Clubs
              @if (clubService.searchQuery()) {
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                  — {{ clubService.filteredClubs().length }} result{{ clubService.filteredClubs().length === 1 ? '' : 's' }}
                </span>
              }
            </h2>
          </div>

          @if (clubService.isLoading()) {
            <!-- Loading spinner -->
            <div class="py-16" aria-busy="true" aria-label="Loading clubs">
              <app-loading-spinner size="lg" />
            </div>
          } @else if (clubService.filteredClubs().length === 0) {
            <!-- Empty state -->
            @if (clubService.searchQuery()) {
              <app-empty-state
                icon="🔍"
                title="No clubs match your search"
                description="Try a different keyword or clear the search to see all clubs."
                actionLabel="Clear search"
                (actionClick)="clubService.setSearchQuery('')"
              />
            } @else {
              <app-empty-state
                icon="📚"
                title="No clubs yet"
                description="Be the first to create a book club and start reading together!"
              />
            }
          } @else {
            <!-- Clubs grid -->
            <ul
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label="Available clubs"
            >
              @for (club of clubService.filteredClubs(); track club.id) {
                <li class="rounded-2xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
                  <!-- Cover -->
                  @if (club.coverUrl) {
                    <img
                      [src]="club.coverUrl"
                      [alt]="''"
                      class="h-40 w-full object-cover"
                      aria-hidden="true"
                    />
                  } @else {
                    <div class="bg-gradient-to-br from-primary-400 to-accent-500 h-40" aria-hidden="true"></div>
                  }

                  <!-- Card body -->
                  <div class="flex flex-col flex-1 p-5 gap-3">
                    <!-- Title + badge -->
                    <div>
                      <div class="flex items-start justify-between gap-2">
                        <h3 class="font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                          {{ club.name }}
                        </h3>
                        <span class="shrink-0 rounded-full bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300 whitespace-nowrap">
                          👥 {{ club.memberCount }}
                        </span>
                      </div>
                      @if (club.description) {
                        <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {{ club.description }}
                        </p>
                      }
                    </div>

                    <!-- Action buttons -->
                    <div class="mt-auto flex gap-2">
                      <a
                        [routerLink]="['/clubs', club.id]"
                        class="flex-1 text-center rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        [attr.aria-label]="'View ' + club.name"
                      >
                        View
                      </a>
                      @if (auth.isAuthenticated() && !clubService.myClubIds().has(club.id)) {
                        <button
                          type="button"
                          (click)="onJoin(club)"
                          [disabled]="joiningClubId() === club.id"
                          class="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          [attr.aria-label]="'Join ' + club.name"
                        >
                          @if (joiningClubId() === club.id) {
                            <svg class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          }
                          Join
                        </button>
                      } @else if (auth.isAuthenticated() && clubService.myClubIds().has(club.id)) {
                        <span class="flex-1 text-center rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400">
                          ✓ Joined
                        </span>
                      }
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </section>
      </div>

      <!-- ── FAB: Create Club (organizers only) ─────────────────────── -->
      @if (auth.isOrganizer()) {
        <a
          routerLink="/clubs/create"
          class="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 transition-colors"
          aria-label="Create a new club"
          title="Create Club"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </a>
      }
    </div>
  `,
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
