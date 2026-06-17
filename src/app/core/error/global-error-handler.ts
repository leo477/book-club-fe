import { ErrorHandler, Injectable, isDevMode } from '@angular/core';
import { track } from '@vercel/analytics';

/**
 * Centralises logging of uncaught client errors. Registered as the app-wide
 * Angular `ErrorHandler`. Errors are always logged to the console (so the dev
 * overlay and prod console keep working) and forwarded to telemetry.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Always surface the error: dev overlay/logging must keep working.
    console.error(error);

    try {
      this.report(error);
    } catch {
      // Never let error reporting throw inside the error handler.
    }
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
