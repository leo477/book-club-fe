import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

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
