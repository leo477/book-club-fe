import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubService } from '../../core/services/club.service';
import { AuthService } from '../../core/auth/auth.service';
import { HlmSpinner } from '../../shared/spartan/spinner/src';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, HlmSpinner, EmptyStateComponent],
  templateUrl: './organizer-dashboard.component.html',
})
export class OrganizerDashboardComponent implements OnInit {
  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly ownedClubs = this.clubService.myOwnedClubs;

  private redirected = false;

  constructor() {
    effect(() => {
      const clubs = this.ownedClubs();
      if (this.redirected || this.isLoading() || clubs.length === 0) return;
      this.redirected = true;
      this.router.navigate(['/clubs', clubs[0].id, 'manage'], { replaceUrl: true });
    });
  }

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
}
