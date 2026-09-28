import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { JoinRequest } from '../../../../core/services/club.service';
import { HlmButton } from '../../../../shared/spartan/button/src';

@Component({
  selector: 'app-club-manage-requests',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, HlmButton],
  templateUrl: './club-manage-requests.component.html',
})
export class ClubManageRequestsComponent {
  readonly joinRequests = input.required<JoinRequest[]>();
  readonly processingRequestUserId = input.required<string | null>();

  readonly approve = output<string>();
  readonly reject = output<string>();
}
