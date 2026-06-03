import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;
  let translate: { currentLang: string; defaultLang: string };

  beforeEach(() => {
    translate = { currentLang: 'uk', defaultLang: 'uk' };
    TestBed.configureTestingModule({
      providers: [
        FormatDatePipe,
        { provide: TranslateService, useValue: translate },
      ],
    });
    pipe = TestBed.inject(FormatDatePipe);
  });

  it('should return em dash for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should return em dash for undefined', () => {
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should return em dash for empty string', () => {
    expect(pipe.transform('')).toBe('—');
  });

  it('should format valid ISO date', () => {
    const result = pipe.transform('2024-01-15T10:00:00Z');
    expect(result).not.toBe('—');
    expect(result).toContain('2024');
  });

  it('should format in English when language is en', () => {
    translate.currentLang = 'en';
    const result = pipe.transform('2024-01-15T10:00:00Z');
    expect(result).toContain('January');
  });
});
