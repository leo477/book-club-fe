import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { HlmCard } from '../../../../shared/spartan/card/src';
import { Club } from '../../../../core/models/club.model';
import { UserProfile } from '../../../../core/models/user.model';
import { BookStoresComponent } from '../../../../shared/book-stores/book-stores.component';

@Component({
  selector: 'app-club-sidebar-right',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, InitialsPipe, HlmCard, BookStoresComponent],
  templateUrl: './club-sidebar-right.component.html',
})
export class ClubSidebarRightComponent {
  readonly club = input.required<Club>();
  readonly organizerProfile = input<UserProfile | null>(null);
  readonly bookTitle = input<string | null>(null);
}
