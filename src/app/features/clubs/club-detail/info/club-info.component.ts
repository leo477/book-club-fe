import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { Club } from '../../../../core/models/club.model';

@Component({
  selector: 'app-club-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './club-info.component.html',
})
export class ClubInfoComponent {
  readonly club = input.required<Club>();
}
