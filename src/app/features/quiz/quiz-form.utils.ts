import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

export interface MetaForm {
  title: FormControl<string>;
  description: FormControl<string>;
}

export interface QuestionForm {
  question: FormControl<string>;
  option0: FormControl<string>;
  option1: FormControl<string>;
  option2: FormControl<string>;
  option3: FormControl<string>;
  correctIndex: FormControl<number>;
}

export const OPTION_INDICES: readonly number[] = [0, 1, 2, 3];

export function buildMetaForm(): FormGroup<MetaForm> {
  return new FormGroup<MetaForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });
}

export function buildQuestionForm(): FormGroup<QuestionForm> {
  return new FormGroup<QuestionForm>({
    question: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
    }),
    option0: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option1: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option2: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option3: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    correctIndex: new FormControl<number>(0, { nonNullable: true }),
  });
}

export function optionLabel(index: number): string {
  return String.fromCodePoint(65 + index);
}

export function isInvalidTouched(ctrl: AbstractControl): boolean {
  return ctrl.invalid && ctrl.touched;
}
