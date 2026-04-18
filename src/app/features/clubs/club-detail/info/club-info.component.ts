import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Club } from '../../../../core/models/club.model';

@Component({
  selector: 'app-club-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  templateUrl: './club-info.component.html',
})
export class ClubInfoComponent {
  readonly club = input.required<Club>();
}
