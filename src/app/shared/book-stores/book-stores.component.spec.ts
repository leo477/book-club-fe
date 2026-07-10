import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BookStoresComponent } from './book-stores.component';
import { environment } from '../../../environments/environment';

interface BookStoreResult {
  name: string;
  url: string;
  found: boolean | null;
  product_url: string | null;
}

describe('BookStoresComponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookStoresComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BookStoresComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('stores() returns [] when bookTitle is null (no HTTP call)', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(BookStoresComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    // default bookTitle is null
    expect(comp.stores()).toEqual([]);
    httpMock.verify();
  });

  it('renders no anchors/buttons and makes no HTTP call when bookTitle is null', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(BookStoresComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('button')).toHaveLength(0);
    httpMock.verify();
  });

  it('skeletons array has exactly 3 entries', () => {
    const fixture = TestBed.createComponent(BookStoresComponent);
    expect(fixture.componentInstance.skeletons).toEqual([1, 2, 3]);
  });

  describe('openStore()', () => {
    it('calls window.open with the store url when url is set', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      const comp = fixture.componentInstance;
      vi.spyOn(window, 'open').mockImplementation(() => null);
      const store: BookStoreResult = {
        name: 'Rozetka',
        url: 'https://rozetka.com.ua',
        found: true,
        product_url: 'https://rozetka.com.ua',
      };
      comp.openStore(store);
      expect(window.open).toHaveBeenCalledWith('https://rozetka.com.ua', '_blank', 'noopener,noreferrer');
    });

    it('does not open non-https urls', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      const comp = fixture.componentInstance;
      vi.spyOn(window, 'open').mockImplementation(() => null);
      const store: BookStoreResult = {
        name: 'Rozetka',
        url: 'javascript:alert(1)',
        found: true,
        product_url: null,
      };
      comp.openStore(store);
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('rxResource stream — non-null title branch (HTTP GET)', () => {
    it('calls HttpClient.get with the encoded title', () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const req = httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
      httpMock.verify();
    });

    it('stores() reflects data returned by the HTTP call', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'Rozetka', url: 'https://rozetka.com.ua', found: true, product_url: 'https://rozetka.com.ua' },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);

      await fixture.whenStable();
      TestBed.flushEffects();

      httpMock.verify();
      expect(fixture.componentInstance.stores()).toEqual(mockStores);
    });
  });

  describe('stores() computed — value() ?? [] fallback', () => {
    it('returns [] when storesResource.value() returns undefined', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      const comp = fixture.componentInstance;
      expect(comp.storesResource.value()).toBeUndefined();
      expect(comp.stores()).toEqual([]);
    });
  });

  describe('badge rendering by found', () => {
    async function renderStores(stores: BookStoreResult[]): Promise<HTMLElement> {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(stores);
      httpMock.verify();
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('found === true → renders the BOOK_STORES.found badge', async () => {
      const el = await renderStores([
        { name: 'Rozetka', url: 'https://rozetka.com.ua', found: true, product_url: 'https://rozetka.com.ua' },
      ]);
      const btn = el.querySelector('button');
      expect(btn?.textContent).toContain('BOOK_STORES.found');
      expect(btn?.textContent).not.toContain('BOOK_STORES.not_found');
    });

    it('found === false → renders the BOOK_STORES.not_found badge', async () => {
      const el = await renderStores([
        { name: 'OLX', url: 'https://google.com/search?q=OLX', found: false, product_url: null },
      ]);
      const btn = el.querySelector('button');
      expect(btn?.textContent).toContain('BOOK_STORES.not_found');
      expect(btn?.textContent).not.toContain('BOOK_STORES.found');
    });

    it('found === null → no badge but the link is still present and clickable', async () => {
      const el = await renderStores([
        { name: 'Yakaboo', url: 'https://google.com/search?q=Yakaboo', found: null, product_url: null },
      ]);
      const btn = el.querySelector<HTMLButtonElement>('button');
      expect(btn).toBeTruthy();
      expect(btn?.textContent).not.toContain('BOOK_STORES.found');
      expect(btn?.textContent).not.toContain('BOOK_STORES.not_found');
      expect(btn?.disabled).toBe(false);
    });

    it('no store renders as disabled regardless of found value', async () => {
      const el = await renderStores([
        { name: 'Rozetka', url: 'https://rozetka.com.ua', found: true, product_url: 'https://rozetka.com.ua' },
        { name: 'OLX', url: 'https://google.com/search?q=OLX', found: false, product_url: null },
        { name: 'Yakaboo', url: 'https://google.com/search?q=Yakaboo', found: null, product_url: null },
      ]);
      const buttons = el.querySelectorAll<HTMLButtonElement>('button');
      expect(buttons).toHaveLength(3);
      buttons.forEach((b) => expect(b.disabled).toBe(false));
    });

    it('does not render store buttons when stores list is empty', async () => {
      const el = await renderStores([]);
      expect(el.querySelectorAll('button')).toHaveLength(0);
    });
  });

  describe('HttpClient.get spy-based tests (fallback approach)', () => {
    it('stream calls http.get with properly encoded URL for non-null title', () => {
      const http = TestBed.inject(HttpClient);
      const stores: BookStoreResult[] = [
        { name: 'Yakaboo', url: 'https://yakaboo.ua', found: true, product_url: 'https://yakaboo.ua' },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(http, 'get').mockReturnValue(of(stores) as any);

      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Harry Potter');
      fixture.detectChanges();

      expect(http.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Harry Potter')}`,
      );
    });
  });
});
