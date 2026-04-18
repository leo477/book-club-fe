import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-club-manage-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule],
  templateUrl: './club-manage-panel.component.html',
})
export class ClubManagePanelComponent {
  readonly clubId = input.required<string>();
}
