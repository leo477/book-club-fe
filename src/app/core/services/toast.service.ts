import { Injectable } from '@angular/core';

type Sonner = typeof import('@spartan-ng/brain/sonner');
type PromiseArg = Parameters<Sonner['toast']['promise']>;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private sonner?: Promise<Sonner>;
  // The sonner toaster clears every pending toast when it is created, and it is mounted deferred (app.html), so
  // a toast raised before that (e.g. by a route guard on a hard load) would be wiped. Hold them until it is up.
  private ready = false;
  private pending: ((toast: Sonner['toast']) => unknown)[] = [];

  markToasterReady(): void {
    this.ready = true;
    const queued = this.pending;
    this.pending = [];
    queued.forEach(fn => this.run(fn));
  }

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
    if (!this.ready) {
      this.pending.push(fn);
      return;
    }
    this.sonner ??= import('@spartan-ng/brain/sonner');
    this.sonner.then(({ toast }) => fn(toast)).catch(() => { /* best-effort */ });
  }
}
