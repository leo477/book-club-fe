import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { readCookie } from '../utils/cookie';

describe('LanguageService', () => {
  let translateSpy: { use: ReturnType<typeof vi.fn> };

  function setup(): LanguageService {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LanguageService,
        { provide: TranslateService, useValue: translateSpy },
      ],
    });
    return TestBed.inject(LanguageService);
  }

  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'lang=; path=/; max-age=0';
    document.documentElement.lang = '';
    translateSpy = { use: vi.fn().mockReturnValue(of(undefined)) };
  });

  afterEach(() => {
    document.cookie = 'lang=; path=/; max-age=0';
    vi.restoreAllMocks();
  });

  describe('initialLang', () => {
    it.each([
      [null, 'uk'],
      ['en', 'en'],
      ['fr', 'uk'],
    ])('resolves saved %s to %s', (saved, expected) => {
      if (saved) localStorage.setItem('lang', saved);
      expect(setup().initialLang).toBe(expected);
    });
  });

  describe('cookie', () => {
    it('prefers the cookie over localStorage', () => {
      document.cookie = 'lang=en; path=/';
      localStorage.setItem('lang', 'uk');
      expect(setup().initialLang).toBe('en');
    });

    it('migrates a localStorage-only value into the cookie', () => {
      localStorage.setItem('lang', 'en');
      setup();
      expect(readCookie('lang')).toBe('en');
    });

    it('ignores an unsupported cookie and falls back to localStorage', () => {
      document.cookie = 'lang=fr; path=/';
      localStorage.setItem('lang', 'en');
      expect(setup().initialLang).toBe('en');
    });

    it('falls back to localStorage on a malformed cookie without throwing', () => {
      document.cookie = 'lang=%E0%A4%A; path=/';
      localStorage.setItem('lang', 'en');
      expect(setup().initialLang).toBe('en');
    });

    it('falls back to the default on a malformed cookie and empty storage', () => {
      document.cookie = 'lang=%E0%A4%A; path=/';
      expect(setup().initialLang).toBe('uk');
    });

    it('writes nothing when neither store has a value', () => {
      setup();
      expect(readCookie('lang')).toBeNull();
    });

    it('use() dual-writes the cookie', async () => {
      await setup().use('en');
      expect(readCookie('lang')).toBe('en');
    });
  });

  describe('use', () => {
    it.each([
      [
        'calls translate.use with the given language',
        () => expect(translateSpy.use).toHaveBeenCalledWith('en'),
      ],
      [
        'persists the language to localStorage',
        () => expect(localStorage.getItem('lang')).toBe('en'),
      ],
      [
        'sets document.documentElement.lang',
        () => expect(document.documentElement.lang).toBe('en'),
      ],
    ])('%s', async (_name, assertEffect) => {
      await setup().use('en');
      assertEffect();
    });
  });
});
