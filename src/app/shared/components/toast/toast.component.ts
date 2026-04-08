import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './toast.component.scss',
  templateUrl: './toast.component.html',
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
