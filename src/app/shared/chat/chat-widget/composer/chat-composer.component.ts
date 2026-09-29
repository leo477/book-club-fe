import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-chat-composer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './chat-composer.component.html',
})
export class ChatComposerComponent {
  readonly value = input.required<string>();

  readonly valueChange = output<string>();
  readonly messageKeydown = output<KeyboardEvent>();
  readonly send = output<void>();
}
