import { ErrorHandler, Injectable, inject, isDevMode } from '@angular/core';
import { track } from '@vercel/analytics';
import { TranslateService } from '@ngx-translate/core';
import { logError } from '../utils/logger.util';

/**
 * Centralises logging of uncaught client errors. Registered as the app-wide
 * Angular `ErrorHandler`. Dev logs to console; production shows a generic
 * toast since these are errors that escaped every other handling path.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly translate = inject(TranslateService);

  handleError(error: unknown): void {
    logError(error);
    if (!isDevMode()) this.notify();

    try {
      this.report(error);
    } catch {
      // Never let error reporting throw inside the error handler.
    }
  }

  private notify(): void {
    import('@spartan-ng/brain/sonner')
      .then(({ toast }) => toast.error(this.translate.instant('ERRORS.unexpected') as string))
      .catch(() => { /* best-effort */ });
  }

  /**
   * Single sink for client error telemetry. Forwards to Vercel Analytics, the
   * only telemetry client the app ships with. To add richer error tracking
   * (e.g. Sentry), capture the error here.
   */
  private report(error: unknown): void {
    if (isDevMode()) return;

    track('client_error', {
      message: this.messageOf(error),
    });
  }

  private messageOf(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return String((error as { message?: unknown })?.message ?? error);
  }
}
