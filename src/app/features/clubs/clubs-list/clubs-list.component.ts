import {
  Component,
  ChangeDetectionStrategy,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club } from '../../../core/models/club.model';
import { SeoService } from '../../../core/services/seo.service';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ClubCardComponent } from './club-card/club-card.component';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

@Component({
  selector: 'app-clubs-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EmptyStateComponent, TranslateModule, ClubCardComponent, HlmSpinner],
  templateUrl: './clubs-list.component.html',
})
export class ClubsListComponent {
  readonly clubService = inject(ClubService);
  readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);

  readonly joiningClubId = signal<string | null>(null);
  readonly ownedClubIds = this.clubService.myOwnedClubIds;
  readonly activeTab = signal<'all' | 'my'>('all');

  constructor() {
    effect(async () => {
      this.seo.setPageI18n('SEO.clubs_title', {
        descriptionKey: 'SEO.clubs_description',
        ogTitleKey: 'SEO.clubs_og_title',
      });
      this.seo.injectWebSiteJsonLd();

      await this.clubService.loadPublicClubs();
      if (this.auth.isAuthenticated()) {
        await this.clubService.loadMyClubs();
      }
    });
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
}
