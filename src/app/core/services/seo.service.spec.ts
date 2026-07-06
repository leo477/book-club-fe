import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, Event as RouterEvent } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let titleSpy: { setTitle: ReturnType<typeof vi.fn> };
  let metaSpy: { updateTag: ReturnType<typeof vi.fn> };
  let translateSpy: { instant: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    titleSpy = { setTitle: vi.fn() };
    metaSpy = { updateTag: vi.fn() };
    translateSpy = { instant: vi.fn().mockImplementation((key: string) => key) };

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
    const calls = metaSpy.updateTag.mock.calls.map(c => c[0]);
    expect(calls.some(c => 'name' in c && (c as { name: string }).name === 'description')).toBe(false);
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
    vi.spyOn(service, 'injectJsonLd');
    service.injectWebSiteJsonLd();
    expect(service.injectJsonLd).toHaveBeenCalled();
  });
});

describe('SeoService — bootstrapLocaleSync', () => {
  let service: SeoService;
  let titleSpy: { setTitle: ReturnType<typeof vi.fn> };
  let metaSpy: { updateTag: ReturnType<typeof vi.fn> };
  let translateSpy: { instant: ReturnType<typeof vi.fn>; getDefaultLang: ReturnType<typeof vi.fn>; currentLang: string | undefined; onLangChange: EventEmitter<LangChangeEvent> };
  let routerSpy: Pick<Router, 'navigate' | 'events'>;
  let langChangeEmitter: EventEmitter<LangChangeEvent>;
  let routerEvents$: Subject<RouterEvent>;

  function buildModule(currentLang: string | undefined = 'en') {
    langChangeEmitter = new EventEmitter<LangChangeEvent>();
    routerEvents$ = new Subject<RouterEvent>();

    titleSpy = { setTitle: vi.fn() };
    metaSpy = { updateTag: vi.fn() };
    translateSpy = {
      instant: vi.fn().mockImplementation((key: string) => key),
      getDefaultLang: vi.fn().mockReturnValue('uk'),
      currentLang,
      onLangChange: langChangeEmitter,
    };
    routerSpy = {
      navigate: vi.fn(),
      events: routerEvents$.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SeoService,
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(SeoService);
  }

  beforeEach(() => buildModule('en'));

  it('sets html lang attribute on call', () => {
    service.bootstrapLocaleSync();
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('is idempotent — calling twice applies meta only once', () => {
    service.bootstrapLocaleSync();
    service.bootstrapLocaleSync();
    const localeCalls = metaSpy.updateTag.mock.calls
      .filter((c: unknown[]) => (c[0] as Record<string, string>)['property'] === 'og:locale');
    expect(localeCalls.length).toBe(1);
  });

  it('updates html lang and og:locale on language change', () => {
    service.bootstrapLocaleSync();
    metaSpy.updateTag.mockClear();

    langChangeEmitter.emit({ lang: 'uk', translations: {} });

    expect(document.documentElement.getAttribute('lang')).toBe('uk');
    const localeCalls = metaSpy.updateTag.mock.calls
      .filter((c: unknown[]) => (c[0] as Record<string, string>)['property'] === 'og:locale');
    expect(localeCalls.length).toBeGreaterThan(0);
    expect((localeCalls[0][0] as Record<string, string>)['content']).toBe('uk_UA');
  });

  it('updates og:url on NavigationEnd router event', () => {
    service.bootstrapLocaleSync();
    metaSpy.updateTag.mockClear();

    routerEvents$.next(new NavigationEnd(1, '/new-page', '/new-page'));

    const ogUrlCalls = metaSpy.updateTag.mock.calls
      .filter((c: unknown[]) => (c[0] as Record<string, string>)['property'] === 'og:url');
    expect(ogUrlCalls.length).toBeGreaterThan(0);
  });

  it('sets title and og tags when translations resolve', () => {
    translateSpy.instant.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        'META.title': 'Book Club',
        'META.description': 'Read together',
        'META.ogTitle': 'Book Club OG',
        'META.ogDescription': 'OG Read together',
        'META.twitterTitle': 'Book Club Twitter',
        'META.twitterDescription': 'Twitter Read together',
      };
      return map[key] ?? key;
    });

    service.bootstrapLocaleSync();

    expect(titleSpy.setTitle).toHaveBeenCalledWith('Book Club');
    expect(metaSpy.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({ property: 'og:title', content: 'Book Club OG' }),
    );
    expect(metaSpy.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'description', content: 'Read together' }),
    );
    expect(metaSpy.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({ property: 'og:description', content: 'OG Read together' }),
    );
  });

  it('falls back to title for og:title when META.ogTitle key not resolved', () => {
    translateSpy.instant.mockImplementation((key: string) =>
      key === 'META.title' ? 'Book Club' : key,
    );

    service.bootstrapLocaleSync();

    expect(metaSpy.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({ property: 'og:title', content: 'Book Club' }),
    );
  });

  it('maps unknown lang to itself in og:locale', () => {
    service.bootstrapLocaleSync();
    langChangeEmitter.emit({ lang: 'fr', translations: {} });
    const localeCalls = metaSpy.updateTag.mock.calls
      .filter((c: unknown[]) => (c[0] as Record<string, string>)['property'] === 'og:locale');
    const frCall = localeCalls.find(
      (c: unknown[]) => (c[0] as Record<string, string>)['content'] === 'fr',
    );
    expect(frCall).toBeDefined();
  });
});

describe('SeoService — bootstrapLocaleSync with no currentLang', () => {
  it('falls back to getDefaultLang() when currentLang is undefined', () => {
    const titleSpy = { setTitle: vi.fn() };
    const metaSpy = { updateTag: vi.fn() };
    const langChangeEmitter = new EventEmitter<LangChangeEvent>();
    const translateSpy = {
      instant: vi.fn().mockImplementation((key: string) => key),
      getDefaultLang: vi.fn().mockReturnValue('uk'),
      currentLang: undefined,
      onLangChange: langChangeEmitter,
    };
    const routerSpy = {
      navigate: vi.fn(),
      events: new Subject<RouterEvent>().asObservable(),
    } satisfies Partial<Router>;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SeoService,
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    const service = TestBed.inject(SeoService);

    service.bootstrapLocaleSync();

    expect(translateSpy.getDefaultLang).toHaveBeenCalled();
    expect(document.documentElement.getAttribute('lang')).toBe('uk');
  });
});
