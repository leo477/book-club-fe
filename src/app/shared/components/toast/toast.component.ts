import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast-enter { animation: slide-in 0.2s ease-out forwards; }
  `],
  template: `
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none"
      aria-live="assertive"
      aria-atomic="false"
      aria-label="Notifications"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          class="toast-enter pointer-events-auto flex items-start gap-3 rounded-xl
                 px-4 py-3 shadow-lg transition-all duration-200"
          [class]="toastClass(toast)"
        >
          <span class="text-lg shrink-0 leading-none mt-0.5" aria-hidden="true">
            {{ toastIcon(toast) }}
          </span>
          <p class="flex-1 text-sm font-medium leading-snug">{{ toast.message }}</p>
          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="shrink-0 text-xl leading-none opacity-60 hover:opacity-100
                   transition-opacity focus:outline-none"
            [attr.aria-label]="'Dismiss: ' + toast.message"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  toastClass(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success:
        'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 ' +
        'text-green-800 dark:text-green-200',
      error:
        'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 ' +
        'text-red-800 dark:text-red-200',
      info:
        'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 ' +
        'text-blue-800 dark:text-blue-200',
    };
    return map[toast.type];
  }

  toastIcon(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
    };
    return map[toast.type];
  }
}
