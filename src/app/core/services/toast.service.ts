import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info', duration = 3000): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type, duration };

    this.toasts.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
