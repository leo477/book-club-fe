import { FormControl } from '@angular/forms';
import { displayNameValidator } from './display-name.validator';

function validate(value: unknown) {
  return displayNameValidator(new FormControl(value));
}

describe('displayNameValidator', () => {
  it('returns null for empty string', () => {
    expect(validate('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(validate(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(validate(undefined)).toBeNull();
  });

  it('returns unsafeChars for non-string value', () => {
    expect(validate(42)).toEqual({ unsafeChars: true });
  });

  it('returns null for valid Latin name', () => {
    expect(validate('John Doe')).toBeNull();
  });

  it('returns null for valid Cyrillic name', () => {
    expect(validate('Іван Петренко')).toBeNull();
  });

  it('returns null for name with allowed punctuation', () => {
    expect(validate("O'Brien-Smith")).toBeNull();
  });

  it('returns unsafeChars for name containing <', () => {
    expect(validate('<script>')).toEqual({ unsafeChars: true });
  });

  it('returns unsafeChars for name containing >', () => {
    expect(validate('foo>bar')).toEqual({ unsafeChars: true });
  });

  it('returns unsafeChars for single character (below min length)', () => {
    expect(validate('A')).toEqual({ unsafeChars: true });
  });

  it('returns unsafeChars for name longer than 50 characters', () => {
    expect(validate('A'.repeat(51))).toEqual({ unsafeChars: true });
  });

  it('returns null for name exactly 2 characters', () => {
    expect(validate('Jo')).toBeNull();
  });

  it('returns null for name exactly 50 characters', () => {
    expect(validate('A'.repeat(50))).toBeNull();
  });
});
