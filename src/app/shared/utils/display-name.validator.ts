import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * SECURITY (L3): allowlist regex for display names.
 *
 * Permits: Latin letters, Cyrillic letters, digits, spaces, and a small set
 * of safe punctuation (`.`, `'`, `-`, `_`). Rejects ANY of `< > " ` &` and
 * other markup-significant characters that could be used to attempt XSS
 * (Angular escapes output, but a literal "<script>" still looks ugly and
 * could trip naive consumers downstream — chat embeds, emails, OG tags).
 *
 * Pattern: anchored, full-string match.
 */
export const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N} .'\-_]{2,50}$/u;

/**
 * Reactive-forms validator that flags display names containing unsafe or
 * disallowed characters. Returns `{ unsafeChars: true }` on failure so the
 * template can render a localized error (`SECURITY.invalid_display_name`).
 *
 * Empty values are considered valid here — pair with `Validators.required`.
 */
export const displayNameValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return { unsafeChars: true };
  return DISPLAY_NAME_PATTERN.test(value) ? null : { unsafeChars: true };
};
