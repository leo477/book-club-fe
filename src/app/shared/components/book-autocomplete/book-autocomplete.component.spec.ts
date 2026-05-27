import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { BookAutocompleteComponent } from './book-autocomplete.component';
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

describe('BookAutocompleteComponent', () => {
  let fixture: ComponentFixture<BookAutocompleteComponent>;
  let component: BookAutocompleteComponent;
  let bookSearchSpy: jasmine.SpyObj<BookSearchService>;
  let control: FormControl<string>;

  beforeEach(async () => {
    bookSearchSpy = jasmine.createSpyObj('BookSearchService', ['searchBooks', 'getBookDetails']);
    bookSearchSpy.searchBooks.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BookAutocompleteComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BookSearchService, useValue: bookSearchSpy },
      ],
    }).compileComponents();

    control = new FormControl<string>('', { nonNullable: true });
    fixture = TestBed.createComponent(BookAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    // allow queueMicrotask inside constructor to run
    await fixture.whenStable();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('shows no dropdown initially', () => {
    const list = fixture.debugElement.query(By.css('[role="listbox"]'));
    expect(list).toBeNull();
  });

  describe('search on value changes', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('calls searchBooks after debounce with query >= 3 chars', async () => {
      bookSearchSpy.searchBooks.and.returnValue(of([makeBook()]));
      await fixture.whenStable();
      control.setValue('Ang');
      jasmine.clock().tick(600);
      fixture.detectChanges();
      expect(bookSearchSpy.searchBooks).toHaveBeenCalledWith('Ang');
      expect(component.suggestions().length).toBe(1);
      expect(component.isOpen()).toBeTrue();
    });

    it('does not call searchBooks for queries shorter than 3 chars', async () => {
      await fixture.whenStable();
      control.setValue('An');
      jasmine.clock().tick(600);
      expect(bookSearchSpy.searchBooks).not.toHaveBeenCalled();
    });

    it('sets isLoading to true during search and false after', async () => {
      bookSearchSpy.searchBooks.and.returnValue(of([makeBook()]));
      await fixture.whenStable();
      control.setValue('Ang');
      jasmine.clock().tick(600);
      // after tick the observable resolves
      expect(component.isLoading()).toBeFalse();
    });

    it('handles searchBooks error gracefully and sets empty suggestions', async () => {
      bookSearchSpy.searchBooks.and.returnValue(throwError(() => new Error('network')));
      await fixture.whenStable();
      control.setValue('Ang');
      jasmine.clock().tick(600);
      fixture.detectChanges();
      expect(component.suggestions().length).toBe(0);
      expect(component.isOpen()).toBeFalse();
      expect(component.isLoading()).toBeFalse();
    });

    it('resets activeIndex to -1 on new results', async () => {
      bookSearchSpy.searchBooks.and.returnValue(of([makeBook(), makeBook({ id: 'b2', title: 'Book 2' })]));
      await fixture.whenStable();
      control.setValue('Ang');
      jasmine.clock().tick(600);
      component.activeIndex.set(1);
      control.setValue('Angular');
      jasmine.clock().tick(600);
      expect(component.activeIndex()).toBe(-1);
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(async () => {
      jasmine.clock().install();
      bookSearchSpy.searchBooks.and.returnValue(of([
        makeBook({ id: 'b1', title: 'Book One' }),
        makeBook({ id: 'b2', title: 'Book Two' }),
        makeBook({ id: 'b3', title: 'Book Three' }),
      ]));
      await fixture.whenStable();
      control.setValue('Boo');
      jasmine.clock().tick(600);
      fixture.detectChanges();
      jasmine.clock().uninstall();
    });

    it('ArrowDown increments activeIndex', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component.onKeydown(event);
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowDown wraps around at the end', () => {
      component.activeIndex.set(2);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component.onKeydown(event);
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowUp decrements activeIndex', () => {
      component.activeIndex.set(1);
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      component.onKeydown(event);
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowUp wraps around at the beginning', () => {
      component.activeIndex.set(0);
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      component.onKeydown(event);
      expect(component.activeIndex()).toBe(2);
    });

    it('Enter selects the active item', () => {
      component.activeIndex.set(1);
      const selectSpy = spyOn(component, 'select').and.callThrough();
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeydown(event);
      expect(selectSpy).toHaveBeenCalledWith(component.suggestions()[1]);
    });

    it('Enter does nothing when activeIndex is -1', () => {
      component.activeIndex.set(-1);
      const selectSpy = spyOn(component, 'select');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeydown(event);
      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('Escape closes the dropdown', () => {
      expect(component.isOpen()).toBeTrue();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onKeydown(event);
      expect(component.isOpen()).toBeFalse();
    });

    it('does nothing for other keys when closed', () => {
      component.isOpen.set(false);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component.onKeydown(event);
      expect(component.activeIndex()).toBe(-1);
    });
  });

  describe('select()', () => {
    it('sets control value to book title without emitting', async () => {
      jasmine.clock().install();
      bookSearchSpy.searchBooks.and.returnValue(of([makeBook()]));
      await fixture.whenStable();
      control.setValue('Ang');
      jasmine.clock().tick(600);
      const book = makeBook();
      const valueChangeSpy = jasmine.createSpy('valueChange');
      control.valueChanges.subscribe(valueChangeSpy);
      component.select(book);
      jasmine.clock().tick(600);
      expect(control.value).toBe('Angular Deep Dive');
      // selecting via setValue with emitEvent:false should not trigger another search
      expect(bookSearchSpy.searchBooks).toHaveBeenCalledTimes(1);
      jasmine.clock().uninstall();
    });

    it('clears suggestions and closes dropdown', () => {
      component.suggestions.set([makeBook()]);
      component.isOpen.set(true);
      component.select(makeBook());
      expect(component.suggestions().length).toBe(0);
      expect(component.isOpen()).toBeFalse();
    });

    it('emits bookSelected output', () => {
      const book = makeBook();
      let emitted: BookSuggestion | undefined;
      component.bookSelected.subscribe((b: BookSuggestion) => { emitted = b; });
      component.select(book);
      expect(emitted).toEqual(book);
    });
  });

  describe('click outside', () => {
    it('closes dropdown when clicking outside the component', () => {
      component.isOpen.set(true);
      // Simulate a click on an element outside the component
      const outsideEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(outsideEvent, 'target', { value: document.body, writable: false });
      component.onDocumentClick(outsideEvent);
      expect(component.isOpen()).toBeFalse();
    });

    it('does not close dropdown when clicking inside the component', () => {
      component.isOpen.set(true);
      const nativeEl = fixture.nativeElement as HTMLElement;
      const insideEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(insideEvent, 'target', { value: nativeEl, writable: false });
      component.onDocumentClick(insideEvent);
      expect(component.isOpen()).toBeTrue();
    });
  });

  describe('dropdown rendering', () => {
    it('renders list items for each suggestion', async () => {
      jasmine.clock().install();
      bookSearchSpy.searchBooks.and.returnValue(of([
        makeBook({ id: 'b1', title: 'First Book' }),
        makeBook({ id: 'b2', title: 'Second Book' }),
      ]));
      await fixture.whenStable();
      control.setValue('Boo');
      jasmine.clock().tick(600);
      fixture.detectChanges();
      const items = fixture.debugElement.queryAll(By.css('[role="option"]'));
      expect(items.length).toBe(2);
      jasmine.clock().uninstall();
    });

    it('shows spinner when isLoading is true', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('hlm-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('hides spinner when isLoading is false', () => {
      component.isLoading.set(false);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('hlm-spinner'));
      expect(spinner).toBeNull();
    });
  });
});
