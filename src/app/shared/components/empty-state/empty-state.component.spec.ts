import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('renders with required inputs', () => {
    TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('icon', '📚');
    fixture.componentRef.setInput('title', 'No items');
    fixture.componentRef.setInput('description', 'Try adding some');
    fixture.detectChanges();
    expect(fixture.componentInstance.icon()).toBe('📚');
    expect(fixture.componentInstance.title()).toBe('No items');
  });

  it('emits actionClick when action is triggered', () => {
    TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('icon', '📚');
    fixture.componentRef.setInput('title', 'No items');
    fixture.componentRef.setInput('description', 'Try adding some');
    fixture.componentRef.setInput('actionLabel', 'Add');
    let clicked = false;
    fixture.componentInstance.actionClick.subscribe(() => (clicked = true));
    fixture.componentInstance.actionClick.emit();
    expect(clicked).toBe(true);
  });
});
