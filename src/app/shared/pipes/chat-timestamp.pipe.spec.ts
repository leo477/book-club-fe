import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChatTimestampPipe } from './chat-timestamp.pipe';

describe('ChatTimestampPipe', () => {
  let pipe: ChatTimestampPipe;
  let mockTranslate: { instant: (k: string) => string; currentLang: string | null; defaultLang: string };

  beforeEach(() => {
    mockTranslate = { instant: (k: string) => k, currentLang: 'uk', defaultLang: 'uk' };

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
    mockTranslate.currentLang = 'en';
    const older = new Date();
    older.setDate(older.getDate() - 10);
    const result = pipe.transform(older.toISOString());
    expect(result).not.toMatch(/^CHAT\.(today|yesterday)/);
    expect(result).toMatch(/\d{2}:\d{2}$/);
    const expected = older.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    expect(result).toContain(expected);
  });

  it('falls back to defaultLang when currentLang is null', () => {
    mockTranslate.currentLang = null;
    const older = new Date();
    older.setDate(older.getDate() - 10);
    const result = pipe.transform(older.toISOString());
    expect(result).not.toMatch(/^CHAT\.(today|yesterday)/);
    const expected = older.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    expect(result).toContain(expected);
  });
});
