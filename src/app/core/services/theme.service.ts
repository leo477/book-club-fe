import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<'light' | 'dark'>('light');

  readonly theme  = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    const saved      = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial    = saved ?? (prefersDark ? 'dark' : 'light');

    this._theme.set(initial);

    effect(() => {
      document.documentElement.classList.toggle('dark', this._theme() === 'dark');
    });
  }

  toggle(): void {
    const next = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    localStorage.setItem('theme', next);
  }
}
