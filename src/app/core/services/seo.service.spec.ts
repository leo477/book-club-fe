import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let titleSpy: jasmine.SpyObj<Title>;
  let metaSpy: jasmine.SpyObj<Meta>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((key: string) => key);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SeoService,
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });
    service = TestBed.inject(SeoService);
  });

  it('setPage() sets title', () => {
    service.setPage({ title: 'My Page' });
    expect(titleSpy.setTitle).toHaveBeenCalledWith('My Page');
  });

  it('setPage() sets og:title and twitter:title', () => {
    service.setPage({ title: 'My Page' });
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'My Page' });
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'twitter:title', content: 'My Page' });
  });

  it('setPage() uses ogTitle when provided', () => {
    service.setPage({ title: 'My Page', ogTitle: 'OG Title' });
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'OG Title' });
  });

  it('setPage() sets description meta tags when provided', () => {
    service.setPage({ title: 'My Page', description: 'A description' });
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'A description' });
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:description', content: 'A description' });
  });

  it('setPage() uses ogDescription when provided', () => {
    service.setPage({ title: 'T', description: 'desc', ogDescription: 'OG desc' });
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:description', content: 'OG desc' });
  });

  it('setPage() does not set description tags when description is absent', () => {
    service.setPage({ title: 'My Page' });
    const calls = metaSpy.updateTag.calls.all().map(c => c.args[0]);
    expect(calls.some(c => 'name' in c && c['name'] === 'description')).toBeFalse();
  });

  it('setPage() sets canonical og:url and link element when canonical provided', () => {
    service.setPage({ title: 'T', canonical: 'https://example.com/page' });
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:url', content: 'https://example.com/page' });
    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe('https://example.com/page');
  });

  it('setPage() reuses existing canonical link element', () => {
    service.setPage({ title: 'T', canonical: 'https://example.com/page1' });
    service.setPage({ title: 'T', canonical: 'https://example.com/page2' });
    const links = document.querySelectorAll('link[rel="canonical"]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('https://example.com/page2');
  });

  it('setPageI18n() calls translate.instant for title', () => {
    service.setPageI18n('TITLE_KEY');
    expect(translateSpy.instant).toHaveBeenCalledWith('TITLE_KEY', undefined);
    expect(titleSpy.setTitle).toHaveBeenCalledWith('TITLE_KEY');
  });

  it('setPageI18n() translates description and ogTitle when keys provided', () => {
    service.setPageI18n('TITLE_KEY', {
      descriptionKey: 'DESC_KEY',
      ogTitleKey: 'OG_KEY',
    });
    expect(translateSpy.instant).toHaveBeenCalledWith('DESC_KEY', undefined);
    expect(translateSpy.instant).toHaveBeenCalledWith('OG_KEY', undefined);
  });

  it('injectJsonLd() adds script to head', () => {
    service.injectJsonLd({ '@context': 'https://schema.org', '@type': 'WebSite' });
    const script = document.head.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.textContent).toContain('WebSite');
  });

  it('injectJsonLd() replaces existing script', () => {
    service.injectJsonLd({ '@type': 'WebSite' });
    service.injectJsonLd({ '@type': 'Organization' });
    const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
    expect(scripts[0].textContent).toContain('Organization');
  });

  it('injectWebSiteJsonLd() calls injectJsonLd', () => {
    spyOn(service, 'injectJsonLd').and.callThrough();
    service.injectWebSiteJsonLd();
    expect(service.injectJsonLd).toHaveBeenCalled();
  });
});
