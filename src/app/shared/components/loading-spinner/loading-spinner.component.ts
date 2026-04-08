import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClass()" role="status" aria-label="Loading">
      <div [class]="spinnerClass()"></div>
      <span class="sr-only">Loading…</span>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly containerClass = computed(() => 'flex items-center justify-center');

  readonly spinnerClass = computed(() => {
    const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-4',
    };
    return `${sizeMap[this.size()]} rounded-full border-primary-200 border-t-primary-600 animate-spin`;
  });
}
