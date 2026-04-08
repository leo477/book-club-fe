import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

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
