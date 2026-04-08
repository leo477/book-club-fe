import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="text-5xl mb-4" aria-hidden="true">{{ icon() }}</div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ title() }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{{ description() }}</p>
      @if (actionLabel()) {
        <button
          type="button"
          (click)="actionClick.emit()"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium
                 transition-all duration-200 focus:outline-none focus:ring-2
                 focus:ring-primary-500 focus:ring-offset-2"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly actionLabel = input<string | undefined>(undefined);

  readonly actionClick = output<void>();
}
