import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

export interface SocialField {
  key: string;
  label: string;
  labelClass: string;
  placeholder: string;
  focusRingClass: string;
}

@Component({
  selector: 'app-social-link-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './social-link-field.component.html',
})
export class SocialLinkFieldComponent {
  readonly config = input.required<SocialField>();
  readonly form = input.required<FormGroup>();
}
