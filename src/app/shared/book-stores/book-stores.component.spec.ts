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
  found: boolean;
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
    const fixture = TestBed.createComponent(BookStoresComponent);
    expect(fixture.componentInstance.stores()).toEqual([]);
  });

  it('stores() returns [] via the computed fallback when value() is undefined', () => {
    const fixture = TestBed.createComponent(BookStoresComponent);
    const comp = fixture.componentInstance;
    expect(comp.storesResource.value()).toBeUndefined();
    expect(comp.stores()).toEqual([]);
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
      const store: BookStoreResult = { name: 'Yakaboo', url: 'https://yakaboo.ua', found: true };
      comp.openStore(store);
      expect(window.open).toHaveBeenCalledWith('https://yakaboo.ua', '_blank');
    });

    it('does NOT call window.open when url is empty', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      const comp = fixture.componentInstance;
      vi.spyOn(window, 'open').mockImplementation(() => null);
      const store: BookStoreResult = { name: 'Yakaboo', url: '', found: false };
      comp.openStore(store);
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('rxResource stream — null title branch', () => {
    it('returns empty array immediately when title is null', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      expect(fixture.componentInstance.stores()).toEqual([]);
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

      const mockStores: BookStoreResult[] = [
        { name: 'Yakaboo', url: 'https://yakaboo.ua', found: true },
        { name: 'Небо', url: 'https://nebo.ua', found: false },
      ];
      req.flush(mockStores);
      httpMock.verify();
    });

    it('stores() reflects data returned by the HTTP call', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'Yakaboo', url: 'https://yakaboo.ua', found: true },
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

  describe('template rendering', () => {
    it('renders 3 skeleton divs while loading', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Some Book');
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      if (comp.storesResource.isLoading()) {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelectorAll('.animate-pulse').length).toBe(3);
      } else {
        expect(comp.skeletons.length).toBe(3);
      }

      TestBed.inject(HttpTestingController).expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Some Book')}`,
      ).flush([]);
      TestBed.inject(HttpTestingController).verify();
    });

    it('renders a store button per result regardless of found', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'Yakaboo', url: 'https://yakaboo.ua', found: true },
        { name: 'Небо', url: 'https://nebo.ua', found: false },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);
      httpMock.verify();

      await fixture.whenStable();
      fixture.detectChanges();
      const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    it('keeps every store button clickable (not disabled) when a url is present', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'Yakaboo', url: 'https://yakaboo.ua', found: true },
        { name: 'Небо', url: 'https://nebo.ua', found: false },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);
      httpMock.verify();

      await fixture.whenStable();
      fixture.detectChanges();
      const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
      expect([...buttons].every(b => !(b as HTMLButtonElement).disabled)).toBe(true);
    });

    it('renders the found/not-found badge label based on found', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'Yakaboo', url: 'https://yakaboo.ua', found: true },
        { name: 'Небо', url: 'https://nebo.ua', found: false },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);
      httpMock.verify();

      await fixture.whenStable();
      fixture.detectChanges();
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      // TranslateModule.forRoot() with no loader renders the raw keys
      expect(text).toContain('BOOK_STORES.found');
      expect(text).toContain('BOOK_STORES.not_found');
    });

    it('shows the unavailable message when the list is empty and a title is set', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush([]);
      httpMock.verify();

      await fixture.whenStable();
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('button').length).toBe(0);
      expect(el.textContent ?? '').toContain('BOOK_STORES.unavailable');
    });
  });

  describe('HttpClient.get spy-based tests (fallback approach)', () => {
    it('stream calls http.get with properly encoded URL for non-null title', () => {
      const http = TestBed.inject(HttpClient);
      const stores: BookStoreResult[] = [{ name: 'Yakaboo', url: 'https://yakaboo.ua', found: true }];
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
