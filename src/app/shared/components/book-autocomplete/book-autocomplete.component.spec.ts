import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { BookAutocompleteComponent, BOOK_SEARCH_DEBOUNCE_MS } from './book-autocomplete.component';
import { BookSearchService } from '../../../core/services/book-search.service';
import { BookSuggestion } from '../../../core/models/book.model';

const makeBook = (overrides: Partial<BookSuggestion> = {}): BookSuggestion => ({
  id: 'b1',
  title: 'Angular Deep Dive',
  authors: ['John Doe'],
  description: null,
  thumbnail: null,
  publishedDate: '2023',
  publisher: null,
  ...overrides,
});

/** Wait for debounceTime(0) to fire via asyncScheduler (one macrotask). */
const nextTick = () => new Promise<void>(resolve => setTimeout(resolve, 50));

describe('BookAutocompleteComponent', () => {
  let fixture: ComponentFixture<BookAutocompleteComponent>;
  let component: BookAutocompleteComponent;
  let bookSearchSpy: { searchBooks: ReturnType<typeof vi.fn>; getBookDetails: ReturnType<typeof vi.fn> };
  let control: FormControl<string>;

  beforeEach(async () => {
    bookSearchSpy = {
      searchBooks: vi.fn().mockReturnValue(of([])),
      getBookDetails: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [BookAutocompleteComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BookSearchService, useValue: bookSearchSpy },
        // Use 0ms debounce so tests don't need to wait 600ms or mock timers.
        { provide: BOOK_SEARCH_DEBOUNCE_MS, useValue: 0 },
      ],
    }).compileComponents();

    control = new FormControl<string>('', { nonNullable: true });
    fixture = TestBed.createComponent(BookAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    // flush queueMicrotask that sets up the valueChanges subscription
    await fixture.whenStable();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('shows no dropdown initially', () => {
    expect(fixture.debugElement.query(By.css('[role="listbox"]'))).toBeNull();
  });

  // ── Debounce / search ─────────────────────────────────────────────────────
  describe('search on value changes', () => {
    it('calls searchBooks for query >= 3 chars', async () => {
      bookSearchSpy.searchBooks.mockReturnValue(of([makeBook()]));
      control.setValue('Ang');
      await nextTick();
      fixture.detectChanges();
      expect(bookSearchSpy.searchBooks).toHaveBeenCalledWith('Ang');
      expect(component.suggestions().length).toBe(1);
      expect(component.isOpen()).toBe(true);
    });

    it('does not call searchBooks for queries shorter than 3 chars', async () => {
      control.setValue('An');
      await nextTick();
      expect(bookSearchSpy.searchBooks).not.toHaveBeenCalled();
    });

    it('sets isLoading to false after search completes', async () => {
      bookSearchSpy.searchBooks.mockReturnValue(of([makeBook()]));
      control.setValue('Ang');
      await nextTick();
      expect(component.isLoading()).toBe(false);
    });

    it('handles searchBooks error gracefully and clears suggestions', async () => {
      bookSearchSpy.searchBooks.mockReturnValue(throwError(() => new Error('network')));
      control.setValue('Ang');
      await nextTick();
      fixture.detectChanges();
      expect(component.suggestions().length).toBe(0);
      expect(component.isOpen()).toBe(false);
      expect(component.isLoading()).toBe(false);
    });

    it('resets activeIndex to -1 on new results', async () => {
      bookSearchSpy.searchBooks.mockReturnValue(of([makeBook(), makeBook({ id: 'b2', title: 'Book 2' })]));
      control.setValue('Ang');
      await nextTick();
      component.activeIndex.set(1);
      control.setValue('Angular');
      await nextTick();
      expect(component.activeIndex()).toBe(-1);
    });
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────
  describe('keyboard navigation', () => {
    beforeEach(async () => {
      bookSearchSpy.searchBooks.mockReturnValue(of([
        makeBook({ id: 'b1', title: 'Book One' }),
        makeBook({ id: 'b2', title: 'Book Two' }),
        makeBook({ id: 'b3', title: 'Book Three' }),
      ]));
      control.setValue('Boo');
      await nextTick();
      fixture.detectChanges();
    });

    it('ArrowDown increments activeIndex', () => {
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowDown wraps around at the end', () => {
      component.activeIndex.set(2);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowUp decrements activeIndex', () => {
      component.activeIndex.set(1);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowUp wraps around at the beginning', () => {
      component.activeIndex.set(0);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.activeIndex()).toBe(2);
    });

    it('Enter selects the active item', () => {
      component.activeIndex.set(1);
      const expectedBook = component.suggestions()[1]; // capture before select() clears suggestions
      const selectSpy = vi.spyOn(component, 'select');
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(selectSpy).toHaveBeenCalledWith(expectedBook);
    });

    it('Enter does nothing when activeIndex is -1', () => {
      component.activeIndex.set(-1);
      const selectSpy = vi.spyOn(component, 'select').mockImplementation(() => undefined);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('Escape closes the dropdown', () => {
      expect(component.isOpen()).toBe(true);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.isOpen()).toBe(false);
    });

    it('does nothing for other keys when closed', () => {
      component.isOpen.set(false);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.activeIndex()).toBe(-1);
    });
  });

  // ── select() ─────────────────────────────────────────────────────────────
  describe('select()', () => {
    it('sets control value and does not trigger another search', async () => {
      bookSearchSpy.searchBooks.mockReturnValue(of([makeBook()]));
      control.setValue('Ang');
      await nextTick();
      expect(bookSearchSpy.searchBooks).toHaveBeenCalledTimes(1);
      component.select(makeBook());
      await nextTick();
      expect(control.value).toBe('Angular Deep Dive');
      // setValue with emitEvent:false → valueChanges does not emit → no second search
      expect(bookSearchSpy.searchBooks).toHaveBeenCalledTimes(1);
    });

    it('clears suggestions and closes dropdown', () => {
      component.suggestions.set([makeBook()]);
      component.isOpen.set(true);
      component.select(makeBook());
      expect(component.suggestions().length).toBe(0);
      expect(component.isOpen()).toBe(false);
    });

    it('emits bookSelected output', () => {
      const book = makeBook();
      let emitted: BookSuggestion | undefined;
      component.bookSelected.subscribe((b: BookSuggestion) => { emitted = b; });
      component.select(book);
      expect(emitted).toEqual(book);
    });
  });

  // ── Click outside ─────────────────────────────────────────────────────────
  describe('click outside', () => {
    it('closes dropdown when clicking outside the component', () => {
      component.isOpen.set(true);
      const evt = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(evt, 'target', { value: document.body, writable: false });
      component.onDocumentClick(evt);
      expect(component.isOpen()).toBe(false);
    });

    it('does not close dropdown when clicking inside', () => {
      component.isOpen.set(true);
      const evt = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(evt, 'target', { value: fixture.nativeElement, writable: false });
      component.onDocumentClick(evt);
      expect(component.isOpen()).toBe(true);
    });
  });

  // ── Dropdown rendering ────────────────────────────────────────────────────
  describe('dropdown rendering', () => {
    it('renders list items for each suggestion', async () => {
      bookSearchSpy.searchBooks.mockReturnValue(of([
        makeBook({ id: 'b1', title: 'First Book' }),
        makeBook({ id: 'b2', title: 'Second Book' }),
      ]));
      control.setValue('Boo');
      await nextTick();
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('[role="option"]')).length).toBe(2);
    });

    it('shows spinner when isLoading is true', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('hlm-spinner'))).toBeTruthy();
    });

    it('hides spinner when isLoading is false', () => {
      component.isLoading.set(false);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('hlm-spinner'))).toBeNull();
    });
  });
});
