import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BookStoresComponent } from './book-stores.component';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

interface StoreResult {
  name: string;
  url: string;
  found: boolean | null;
  product_url: string | null;
}

const stores: StoreResult[] = [
  { name: 'Небо', url: 'https://nebo.example/p/1', found: true, product_url: 'https://nebo.example/p/1' },
  { name: 'КСД', url: 'https://google.com/search?q=ksd', found: false, product_url: null },
  { name: 'Yakaboo', url: 'https://google.com/search?q=yakaboo', found: null, product_url: null },
];

describe('BookStoresComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookStoresComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function setupWithTitle(title: string): ComponentFixture<BookStoresComponent> {
    const fixture = TestBed.createComponent(BookStoresComponent);
    fixture.componentRef.setInput('bookTitle', title);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = TestBed.createComponent(BookStoresComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders no anchors when bookTitle is null', () => {
    const fixture = TestBed.createComponent(BookStoresComponent);
    fixture.detectChanges();
    httpMock.expectNone(() => true);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('a').length).toBe(0);
  });

  it('requests the stores endpoint with the encoded title', () => {
    setupWithTitle('Clean Code');
    const req = httpMock.expectOne(
      `${API}/books/stores?title=${encodeURIComponent('Clean Code')}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('shows a loading skeleton while the request is pending', () => {
    const fixture = setupWithTitle('Clean Code');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    httpMock.expectOne(() => true).flush([]);
  });

  it('renders an anchor per store using url as href', async () => {
    const fixture = setupWithTitle('Clean Code');
    httpMock.expectOne(() => true).flush(stores);
    await fixture.whenStable();
    fixture.detectChanges();

    const anchors = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('a'),
    ] as HTMLAnchorElement[];
    expect(anchors.length).toBe(3);
    expect(anchors.map((a) => a.getAttribute('href'))).toEqual(stores.map((s) => s.url));
    anchors.forEach((a) => {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  it('renders badges derived from found (true → in-stock, false → not-found, null → none)', async () => {
    const fixture = setupWithTitle('Clean Code');
    httpMock.expectOne(() => true).flush(stores);
    await fixture.whenStable();
    fixture.detectChanges();

    const anchors = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('a'),
    ] as HTMLAnchorElement[];

    // found === true → positive badge present
    expect(anchors[0].querySelector('span.rounded-full')?.textContent?.trim())
      .toBe('BOOK_STORES.found');
    // found === false → muted badge present
    expect(anchors[1].querySelector('span.rounded-full')?.textContent?.trim())
      .toBe('BOOK_STORES.not_found');
    // found === null → no definitive badge
    expect(anchors[2].querySelector('span.rounded-full')).toBeNull();
  });
});
