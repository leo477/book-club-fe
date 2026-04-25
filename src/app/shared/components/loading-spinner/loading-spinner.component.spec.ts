import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let fixture: ComponentFixture<LoadingSpinnerComponent>;
  let component: LoadingSpinnerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('size defaults to md', () => {
    expect(component.size()).toBe('md');
  });

  it('spinnerClass contains md size classes by default', () => {
    expect(component.spinnerClass()).toContain('h-8');
    expect(component.spinnerClass()).toContain('w-8');
  });

  it('spinnerClass contains sm size classes when size is sm', () => {
    fixture.componentRef.setInput('size', 'sm');
    expect(component.spinnerClass()).toContain('h-4');
    expect(component.spinnerClass()).toContain('w-4');
  });

  it('spinnerClass contains lg size classes when size is lg', () => {
    fixture.componentRef.setInput('size', 'lg');
    expect(component.spinnerClass()).toContain('h-12');
    expect(component.spinnerClass()).toContain('w-12');
  });

  it('containerClass always returns flex classes', () => {
    expect(component.containerClass()).toContain('flex');
    expect(component.containerClass()).toContain('items-center');
    expect(component.containerClass()).toContain('justify-center');
  });

  it('spinnerClass always contains animate-spin', () => {
    expect(component.spinnerClass()).toContain('animate-spin');
  });
});
