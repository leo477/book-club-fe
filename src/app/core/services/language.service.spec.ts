import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

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
    document.documentElement.lang = '';
    translateSpy = { use: vi.fn().mockReturnValue(of(undefined)) };
  });

  describe('initialLang', () => {
    it('defaults to uk when nothing is saved', () => {
      const service = setup();
      expect(service.initialLang).toBe('uk');
    });

    it('reads a previously saved supported language', () => {
      localStorage.setItem('lang', 'en');
      const service = setup();
      expect(service.initialLang).toBe('en');
    });

    it('falls back to uk when the saved value is unsupported', () => {
      localStorage.setItem('lang', 'fr');
      const service = setup();
      expect(service.initialLang).toBe('uk');
    });
  });

  describe('use', () => {
    it('calls translate.use with the given language', async () => {
      const service = setup();
      await service.use('en');
      expect(translateSpy.use).toHaveBeenCalledWith('en');
    });

    it('persists the language to localStorage', async () => {
      const service = setup();
      await service.use('en');
      expect(localStorage.getItem('lang')).toBe('en');
    });

    it('sets document.documentElement.lang', async () => {
      const service = setup();
      await service.use('en');
      expect(document.documentElement.lang).toBe('en');
    });
  });
});
