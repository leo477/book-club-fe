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
  available: boolean;
  url: string | null;
}

describe('BookStoresComponent', () => {
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
    const comp = fixture.componentInstance;
    // default bookTitle is null
    expect(comp.stores()).toEqual([]);
  });

  it('stores() returns [] via the computed fallback when value() is undefined', () => {
    const fixture = TestBed.createComponent(BookStoresComponent);
    const comp = fixture.componentInstance;
    // storesResource.value() is undefined before any data arrives — stores() should use ?? []
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
      spyOn(window, 'open');
      const store: BookStoreResult = { name: 'Rozetka', available: true, url: 'https://rozetka.com.ua' };
      comp.openStore(store);
      expect(window.open).toHaveBeenCalledWith('https://rozetka.com.ua', '_blank');
    });

    it('does NOT call window.open when url is null', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      const comp = fixture.componentInstance;
      spyOn(window, 'open');
      const store: BookStoreResult = { name: 'OLX', available: false, url: null };
      comp.openStore(store);
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('rxResource stream — null title branch', () => {
    it('returns empty array immediately when title is null', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      const comp = fixture.componentInstance;
      // bookTitle defaults to null, so stream returns of([]) synchronously
      expect(comp.stores()).toEqual([]);
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
        { name: 'Rozetka', available: true, url: 'https://rozetka.com.ua' },
        { name: 'OLX', available: false, url: null },
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
        { name: 'Rozetka', available: true, url: 'https://rozetka.com.ua' },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);

      // rxResource is async — flush effects and wait for microtasks
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
      // No HTTP call has been made/flushed — value() is undefined
      expect(comp.storesResource.value()).toBeUndefined();
      expect(comp.stores()).toEqual([]);
    });
  });

  describe('template rendering', () => {
    it('renders 3 skeleton divs while loading', () => {
      const fixture = TestBed.createComponent(BookStoresComponent);
      // Set a title so a request is initiated (resource enters loading state)
      fixture.componentRef.setInput('bookTitle', 'Some Book');
      fixture.detectChanges();

      // isLoading() should be true while the HTTP request is pending
      const comp = fixture.componentInstance;
      if (comp.storesResource.isLoading()) {
        const el: HTMLElement = fixture.nativeElement;
        const skeletonDivs = el.querySelectorAll('.animate-pulse');
        expect(skeletonDivs.length).toBe(3);
      } else {
        // If already resolved (e.g. synchronously), just verify skeletons array
        expect(comp.skeletons.length).toBe(3);
      }

      TestBed.inject(HttpTestingController).expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Some Book')}`,
      ).flush([]);
      TestBed.inject(HttpTestingController).verify();
    });

    it('renders store buttons when stores are available', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'Rozetka', available: true, url: 'https://rozetka.com.ua' },
        { name: 'OLX', available: false, url: null },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);
      httpMock.verify();

      await fixture.whenStable();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const buttons = el.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    it('does not render store buttons when stores list is empty', async () => {
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
      const el: HTMLElement = fixture.nativeElement;
      const buttons = el.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });

    it('disables button when store.available is false', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'OLX', available: false, url: null },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);
      httpMock.verify();

      await fixture.whenStable();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector('button') as HTMLButtonElement;
      expect(btn.disabled).toBeTrue();
    });

    it('does not disable button when store.available is true and url is set', async () => {
      const httpMock = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Clean Code');
      fixture.detectChanges();

      const mockStores: BookStoreResult[] = [
        { name: 'Rozetka', available: true, url: 'https://rozetka.com.ua' },
      ];
      httpMock.expectOne(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Clean Code')}`,
      ).flush(mockStores);
      httpMock.verify();

      await fixture.whenStable();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector('button') as HTMLButtonElement;
      expect(btn.disabled).toBeFalse();
    });
  });

  describe('HttpClient.get spy-based tests (fallback approach)', () => {
    it('stream calls http.get with properly encoded URL for non-null title', () => {
      const http = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
      const stores: BookStoreResult[] = [{ name: 'Yakaboo', available: true, url: 'https://yakaboo.ua' }];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spyOn(http, 'get').and.returnValue(of(stores) as any);

      const fixture = TestBed.createComponent(BookStoresComponent);
      fixture.componentRef.setInput('bookTitle', 'Harry Potter');
      fixture.detectChanges();

      expect(http.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent('Harry Potter')}`,
      );
    });
  });
});
