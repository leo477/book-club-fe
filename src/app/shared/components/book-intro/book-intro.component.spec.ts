import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BookIntroComponent } from './book-intro.component';

describe('BookIntroComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookIntroComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BookIntroComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('state starts as "closed"', () => {
    const fixture = TestBed.createComponent(BookIntroComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    expect(comp.state()).toBe('closed');
  });

  it('entering starts as true', () => {
    const fixture = TestBed.createComponent(BookIntroComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.entering()).toBeTrue();
  });
});
