import { DestroyRef, EnvironmentInjector, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * Sets <title> from route `title` and keeps og:title / twitter:title in sync.
 * Route `title` values are treated as i18n keys (translated via
 * TranslateService) rather than literal text, so switching language updates
 * the tab title too. Routes without a `title` are left untouched so
 * components can later call SeoService.setPageI18n and own the og:title.
 *
 * TranslateService is resolved lazily via the injector (not injected in the
 * constructor): this class is itself a Router dependency (TitleStrategy), so
 * eagerly constructing TranslateService here — which pulls in HttpClient and
 * the auth interceptor, which injects Router — triggers NG0200 (circular
 * dependency) while Router is still being constructed. Resolving it lazily
 * on the first real `updateTitle()` call happens well after Router
 * construction has finished.
 */
@Injectable({ providedIn: 'root' })
export class OgTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly injector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private translate: TranslateService | null = null;
  private currentTitleKey: string | undefined;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titleKey = this.buildTitle(snapshot);
    this.currentTitleKey = titleKey;
    if (titleKey === undefined) return;
    this.applyTitle(titleKey);
  }

  private getTranslate(): TranslateService {
    if (!this.translate) {
      this.translate = this.injector.get(TranslateService);
      this.translate.onLangChange
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.currentTitleKey) this.applyTitle(this.currentTitleKey);
        });
    }
    return this.translate;
  }

  private applyTitle(titleKey: string): void {
    const title = this.getTranslate().instant(titleKey) as string;
    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }
}
