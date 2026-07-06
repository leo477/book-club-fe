import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

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
    const saved = localStorage.getItem(STORAGE_KEY) as AppLang | null;
    return saved && SUPPORTED.has(saved) ? saved : DEFAULT_LANG;
  }

  async use(lang: AppLang): Promise<void> {
    await firstValueFrom(this.translate.use(lang));
    localStorage.setItem(STORAGE_KEY, lang);
    this.document.documentElement.lang = lang;
  }
}
