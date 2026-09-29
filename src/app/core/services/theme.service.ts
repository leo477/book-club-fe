import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { readCookie, writeCookie } from '../utils/cookie';

const isTheme = (v: string | null): v is 'light' | 'dark' => v === 'light' || v === 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly _theme = signal<'light' | 'dark'>('light');

  readonly theme  = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    const cookie = readCookie('theme');
    const stored = localStorage.getItem('theme');
    const saved = isTheme(cookie) ? cookie : isTheme(stored) ? stored : null;
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial    = saved ?? (prefersDark ? 'dark' : 'light');

    if (!isTheme(cookie) && saved) writeCookie('theme', saved);

    this._theme.set(initial);

    effect(() => {
      this.document.documentElement.classList.toggle('dark', this._theme() === 'dark');
    });
  }

  toggle(): void {
    const next = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    localStorage.setItem('theme', next);
    writeCookie('theme', next);
  }
}
