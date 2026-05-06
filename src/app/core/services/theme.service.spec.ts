import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ThemeService],
    });
    service = TestBed.inject(ThemeService);
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
