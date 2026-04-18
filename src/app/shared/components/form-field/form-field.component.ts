import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  private readonly translate = inject(TranslateService);

  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | null>>();
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');

  readonly formControl = computed(() => this.control());

  readonly hasError = computed(() => {
    const ctrl = this.control();
    return ctrl.invalid && ctrl.touched;
  });

  private readonly _lang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: this.translate.currentLang ?? 'uk' },
  );

  readonly errorMessage = computed(() => {
    this._lang();
    const ctrl = this.control();
    if (!ctrl.errors) return '';
    if (ctrl.errors['required']) return this.translate.instant('FORM_ERRORS.required');
    if (ctrl.errors['email']) return this.translate.instant('FORM_ERRORS.email');
    if (ctrl.errors['minlength']) {
      const req = (ctrl.errors['minlength'] as { requiredLength: number }).requiredLength;
      return this.translate.instant('FORM_ERRORS.minlength', { requiredLength: req });
    }
    return this.translate.instant('FORM_ERRORS.invalid');
  });
}
