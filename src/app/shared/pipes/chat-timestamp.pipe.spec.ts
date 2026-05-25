import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChatTimestampPipe } from './chat-timestamp.pipe';

function makeMockTranslate(overrides: Partial<{ currentLang: string | null; defaultLang: string }> = {}) {
  return {
    instant: (k: string) => k,
    currentLang: overrides.currentLang !== undefined ? overrides.currentLang : 'uk',
    defaultLang: overrides.defaultLang ?? 'uk',
  };
}

describe('ChatTimestampPipe', () => {
  let pipe: ChatTimestampPipe;
  let mockTranslate: ReturnType<typeof makeMockTranslate>;

  function buildPipe(translate: ReturnType<typeof makeMockTranslate>): ChatTimestampPipe {
    TestBed.overrideProvider(TranslateService, { useValue: translate });
    return TestBed.runInInjectionContext(() => new ChatTimestampPipe());
  }

  beforeEach(() => {
    mockTranslate = makeMockTranslate();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: TranslateService, useValue: mockTranslate },
      ],
    });

    pipe = TestBed.runInInjectionContext(() => new ChatTimestampPipe());
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns empty string for an invalid date string', () => {
    expect(pipe.transform('not-a-date')).toBe('');
  });

  it('returns "CHAT.today HH:mm" for today\'s date (string input)', () => {
    const now = new Date();
    const result = pipe.transform(now.toISOString());
    expect(result).toMatch(/^CHAT\.today \d{2}:\d{2}$/);
  });

  it('returns "CHAT.today HH:mm" for today\'s date (Date object input)', () => {
    const now = new Date();
    const result = pipe.transform(now);
    expect(result).toMatch(/^CHAT\.today \d{2}:\d{2}$/);
  });

  it('returns "CHAT.yesterday HH:mm" for yesterday\'s date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = pipe.transform(yesterday.toISOString());
    expect(result).toMatch(/^CHAT\.yesterday \d{2}:\d{2}$/);
  });

  it('formats older date with uk-UA locale when currentLang is "uk"', () => {
    const older = new Date();
    older.setDate(older.getDate() - 10);
    const result = pipe.transform(older.toISOString());
    // Should not be today or yesterday label
    expect(result).not.toMatch(/^CHAT\.(today|yesterday)/);
    // Should end with a time
    expect(result).toMatch(/\d{2}:\d{2}$/);
    // The short date should be formatted with uk-UA locale
    const expected = older.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    expect(result).toContain(expected);
  });

  it('formats older date with en-US locale when currentLang is "en"', () => {
    const translate = makeMockTranslate({ currentLang: 'en', defaultLang: 'uk' });
    const localPipe = buildPipe(translate);

    const older = new Date();
    older.setDate(older.getDate() - 10);
    const result = localPipe.transform(older.toISOString());
    expect(result).not.toMatch(/^CHAT\.(today|yesterday)/);
    expect(result).toMatch(/\d{2}:\d{2}$/);
    const expected = older.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    expect(result).toContain(expected);
  });

  it('falls back to defaultLang when currentLang is null', () => {
    const translate = makeMockTranslate({ currentLang: null, defaultLang: 'uk' });
    const localPipe = buildPipe(translate);

    const older = new Date();
    older.setDate(older.getDate() - 10);
    const result = localPipe.transform(older.toISOString());
    expect(result).not.toMatch(/^CHAT\.(today|yesterday)/);
    // defaultLang is 'uk' so should use uk-UA locale
    const expected = older.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    expect(result).toContain(expected);
  });
});
