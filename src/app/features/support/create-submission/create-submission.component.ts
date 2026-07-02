import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SupportService } from '../../../core/services/support.service';
import { SeoService } from '../../../core/services/seo.service';
import { SubmissionType } from '../../../core/models/support.model';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

interface CreateSubmissionForm {
  type: FormControl<SubmissionType>;
  title: FormControl<string>;
  body: FormControl<string>;
}

@Component({
  selector: 'app-create-submission',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './create-submission.component.html',
})
export class CreateSubmissionComponent {
  private readonly support = inject(SupportService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly types: SubmissionType[] = ['complaint', 'suggestion', 'comment'];

  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  private readonly _isSubmitting = signal(false);
  readonly isSubmitting = this._isSubmitting.asReadonly();

  readonly form = new FormGroup<CreateSubmissionForm>({
    type: new FormControl<SubmissionType>('suggestion', { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    }),
    body: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],
    }),
  });

  constructor() {
    this.seo.setPageI18n('SUPPORT.create_title');
  }

  cancel(): void {
    this.router.navigate(['/support']).catch(() => { /* */ });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this._isSubmitting.set(true);
    this._errorMessage.set(null);

    const { type, title, body } = this.form.getRawValue();

    try {
      await this.support.submit({ type, title: title.trim(), body: body.trim() });
      await this.router.navigate(['/support']);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      this._isSubmitting.set(false);
    }
  }
}
