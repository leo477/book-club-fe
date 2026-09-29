import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ThemeService } from './theme.service';
import { readCookie } from '../utils/cookie';

describe('ThemeService', () => {
  let service: ThemeService;

  function create(): ThemeService {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ThemeService],
    });
    return TestBed.inject(ThemeService);
  }

  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'theme=; path=/; max-age=0';
    service = create();
  });

  afterEach(() => {
    document.cookie = 'theme=; path=/; max-age=0';
    vi.restoreAllMocks();
  });

  describe('cookie', () => {
    beforeEach(() => TestBed.resetTestingModule());

    it('falls back to localStorage on a malformed cookie without throwing', () => {
      document.cookie = 'theme=%E0%A4%A; path=/';
      localStorage.setItem('theme', 'dark');
      expect(create().theme()).toBe('dark');
    });

    it('falls back to a valid default on a malformed cookie and empty storage', () => {
      document.cookie = 'theme=%E0%A4%A; path=/';
      expect(['light', 'dark']).toContain(create().theme());
    });

    it('prefers the cookie over localStorage', () => {
      document.cookie = 'theme=dark; path=/';
      localStorage.setItem('theme', 'light');
      expect(create().theme()).toBe('dark');
    });

    it('migrates a localStorage-only value into the cookie', () => {
      localStorage.setItem('theme', 'dark');
      create();
      expect(readCookie('theme')).toBe('dark');
    });

    it('ignores an invalid cookie and uses localStorage', () => {
      document.cookie = 'theme=blue; path=/';
      localStorage.setItem('theme', 'dark');
      expect(create().theme()).toBe('dark');
      expect(readCookie('theme')).toBe('dark');
    });

    it('writes no cookie when nothing was saved', () => {
      create();
      expect(readCookie('theme')).toBeNull();
    });

    it('toggle() dual-writes the cookie', () => {
      const s = create();
      s.toggle();
      expect(readCookie('theme')).toBe(s.theme());
    });
  });

  it('initialises with a valid theme', () => {
    expect(['light', 'dark']).toContain(service.theme());
  });

  it('isDark reflects current theme', () => {
    expect(service.isDark()).toBe(service.theme() === 'dark');
  });

  describe('toggle', () => {
    it('switches theme and persists to localStorage', () => {
      const before = service.theme();
      service.toggle();
      const after = service.theme();
      expect(after).toBe(before === 'dark' ? 'light' : 'dark');
      expect(localStorage.getItem('theme')).toBe(after);
    });

    it('toggling twice returns to original theme', () => {
      const original = service.theme();
      service.toggle();
      service.toggle();
      expect(service.theme()).toBe(original);
    });
  });
});
