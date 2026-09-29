import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { readCookie, writeCookie } from '../utils/cookie';

export type AppLang = 'en' | 'uk';

const STORAGE_KEY = 'lang';
const SUPPORTED = new Set<AppLang>(['en', 'uk']);
const DEFAULT_LANG: AppLang = 'uk';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly initialLang = this.resolveInitial();

  private resolveInitial(): AppLang {
    const cookie = readCookie(STORAGE_KEY) as AppLang | null;
    if (cookie && SUPPORTED.has(cookie)) return cookie;
    const saved = localStorage.getItem(STORAGE_KEY) as AppLang | null;
    if (saved && SUPPORTED.has(saved)) {
      writeCookie(STORAGE_KEY, saved);
      return saved;
    }
    return DEFAULT_LANG;
  }

  async use(lang: AppLang): Promise<void> {
    await firstValueFrom(this.translate.use(lang));
    localStorage.setItem(STORAGE_KEY, lang);
    writeCookie(STORAGE_KEY, lang);
    this.document.documentElement.lang = lang;
  }
}
