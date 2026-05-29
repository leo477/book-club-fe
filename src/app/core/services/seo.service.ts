import { DestroyRef, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const OG_LOCALE_MAP: Record<string, string> = {
  uk: 'uk_UA',
  en: 'en_US',
};

export interface SeoConfig {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private localeSyncStarted = false;

  /**
   * Wires up <html lang>, og:locale, localized <title> / <meta> tags to the
   * current ngx-translate language, and keeps og:url / canonical in sync with
   * route changes. Safe to call multiple times.
   */
  bootstrapLocaleSync(): void {
    if (this.localeSyncStarted) return;
    this.localeSyncStarted = true;

    const apply = (lang: string) => {
      this.applyHtmlLang(lang);
      this.applyLocalizedMeta(lang);
      this.applyOgUrl();
    };

    // Apply for the lang already in effect at bootstrap.
    const current = this.translate.currentLang ?? this.translate.getDefaultLang() ?? 'uk';
    apply(current);

    // Pass event.translations directly so applyLocalizedMeta reads from the
    // freshly-loaded translation object rather than relying on translate.instant(),
    // which may still return the previous language's values at the time the
    // subscriber fires.
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: LangChangeEvent) => {
        this.applyHtmlLang(event.lang);
        this.applyLocalizedMeta(event.lang, event.translations as Record<string, Record<string, string>>);
        this.applyOgUrl();
      });

    this.router?.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyOgUrl());
  }

  private applyHtmlLang(lang: string): void {
    const root = this.document.documentElement;
    if (root) {
      root.setAttribute('lang', lang);
    }
  }

  private applyLocalizedMeta(lang: string, translations?: Record<string, Record<string, string>>): void {
    const get = (key: string): string =>
      translations?.['META']?.[key] ?? this.translate.instant(`META.${key}`);

    const title = get('title');
    const description = get('description');
    const ogLocale = OG_LOCALE_MAP[lang] ?? lang;

    this.applyTitleMeta(title, get('ogTitle'), get('twitterTitle'));
    this.applyDescriptionMeta(description, get('ogDescription'), get('twitterDescription'));
    this.meta.updateTag({ property: 'og:locale', content: ogLocale });
  }

  private applyTitleMeta(title: string, ogTitle: string, twitterTitle: string): void {
    if (!title || title === 'META.title') return;
    this.title.setTitle(title);
    const resolvedOg = ogTitle && ogTitle !== 'META.ogTitle' ? ogTitle : title;
    const resolvedTw = twitterTitle && twitterTitle !== 'META.twitterTitle' ? twitterTitle : title;
    this.meta.updateTag({ property: 'og:title', content: resolvedOg });
    this.meta.updateTag({ name: 'twitter:title', content: resolvedTw });
  }

  private applyDescriptionMeta(description: string, ogDescription: string, twitterDescription: string): void {
    if (!description || description === 'META.description') return;
    const resolvedOg = ogDescription && ogDescription !== 'META.ogDescription' ? ogDescription : description;
    const resolvedTw = twitterDescription && twitterDescription !== 'META.twitterDescription' ? twitterDescription : description;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: resolvedOg });
    this.meta.updateTag({ name: 'twitter:description', content: resolvedTw });
  }

  private applyOgUrl(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const loc = this.document.defaultView?.location;
    if (!loc?.origin) return;
    // Use href so the og:url and canonical reflect the full current URL
    // (origin + path + query string), not a hardcoded domain.
    const url = loc.href;
    this.meta.updateTag({ property: 'og:url', content: url });
    this.setCanonical(url);
    const ogImage = `${loc.origin}/og-image.png`;
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });
  }

  setPage(config: SeoConfig): void {
    const { title, description, ogTitle, ogDescription, canonical } = config;

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'twitter:title', content: ogTitle ?? title });
    this.meta.updateTag({ property: 'og:title', content: ogTitle ?? title });

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: ogDescription ?? description });
    }

    if (canonical) {
      this.meta.updateTag({ property: 'og:url', content: canonical });
      this.setCanonical(canonical);
    }
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setPageI18n(
    titleKey: string,
    opts?: {
      descriptionKey?: string;
      ogTitleKey?: string;
      canonical?: string;
      params?: Record<string, unknown>;
    }
  ): void {
    this.setPage({
      title: this.translate.instant(titleKey, opts?.params),
      description: opts?.descriptionKey
        ? this.translate.instant(opts.descriptionKey, opts?.params)
        : undefined,
      ogTitle: opts?.ogTitleKey
        ? this.translate.instant(opts.ogTitleKey, opts?.params)
        : undefined,
      canonical: opts?.canonical,
    });
  }

  injectWebSiteJsonLd(): void {
    this.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.translate.instant('SEO.site_name'),
      url: this.translate.instant('SEO.site_url'),
      description: this.translate.instant('SEO.site_description'),
    });
  }

  injectJsonLd(schema: object): void {
    // Remove any existing JSON-LD script to avoid duplicates on re-navigation
    const existing = this.document.head.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }
}
