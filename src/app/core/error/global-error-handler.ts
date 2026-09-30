import { ErrorHandler, Injectable, InjectionToken, inject, isDevMode } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../services/toast.service';
import { logError } from '../utils/logger.util';
import { CANARY_TRACK } from '../services/canary-analytics.service';

export const IS_DEV_MODE = new InjectionToken<() => boolean>('IS_DEV_MODE', {
  providedIn: 'root',
  factory: () => isDevMode,
});

/**
 * Centralises logging of uncaught client errors. Registered as the app-wide
 * Angular `ErrorHandler`. Dev logs to console; production shows a generic
 * toast since these are errors that escaped every other handling path.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastService);
  private readonly isDevMode = inject(IS_DEV_MODE);
  private readonly track = inject(CANARY_TRACK);

  handleError(error: unknown): void {
    logError(error);
    if (!this.isDevMode()) this.notify();

    try {
      this.report(error);
    } catch {
      // Never let error reporting throw inside the error handler.
    }
  }

  private notify(): void {
    this.toast.error(this.translate.instant('ERRORS.unexpected') as string);
  }

  /**
   * Single sink for client error telemetry. Forwards to Vercel Analytics, the
   * only telemetry client the app ships with. To add richer error tracking
   * (e.g. Sentry), capture the error here.
   */
  private report(error: unknown): void {
    if (this.isDevMode()) return;

    this.track('client_error', {
      message: this.messageOf(error),
    });
  }

  private messageOf(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return String((error as { message?: unknown })?.message ?? error);
  }
}
