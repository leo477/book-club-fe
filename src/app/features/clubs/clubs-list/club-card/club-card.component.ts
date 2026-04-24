import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Club } from '../../../../core/models/club.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-club-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule],
  templateUrl: './club-card.component.html',
})
export class ClubCardComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwned = input<boolean>(false);
  readonly isAuthenticated = input<boolean>(false);
  readonly joining = input<boolean>(false);

  readonly join = output<void>();
}
