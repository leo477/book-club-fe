import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  templateUrl: './chat-header.component.html',
})
export class ChatHeaderComponent {
  readonly roomsView = input.required<boolean>();
  readonly roomCount = input(0);
  readonly activeRoomName = input<string | null>(null);
  readonly showBackButton = input(false);

  readonly back = output<void>();
  readonly closePanel = output<void>();
}
