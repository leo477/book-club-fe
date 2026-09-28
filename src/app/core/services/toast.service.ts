import { Injectable } from '@angular/core';

type Sonner = typeof import('@spartan-ng/brain/sonner');
type PromiseArg = Parameters<Sonner['toast']['promise']>;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private sonner?: Promise<Sonner>;

  success(message: string): void {
    this.run(t => t.success(message));
  }

  error(message: string): void {
    this.run(t => t.error(message));
  }

  info(message: string): void {
    this.run(t => t.info(message));
  }

  promise<T>(promise: Promise<T>, data: PromiseArg[1]): void {
    this.run(t => t.promise(promise, data));
  }

  private run(fn: (toast: Sonner['toast']) => unknown): void {
    this.sonner ??= import('@spartan-ng/brain/sonner');
    this.sonner.then(({ toast }) => fn(toast)).catch(() => { /* best-effort */ });
  }
}
