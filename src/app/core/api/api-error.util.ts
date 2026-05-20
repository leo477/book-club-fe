import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { BackendHttpError, RequestTimeoutError } from '../interceptors/auth.interceptor';

export function extractApiError(err: unknown): string {
  // Primary path: interceptor-normalized error types.
  if (err instanceof RequestTimeoutError) {
    // Interceptor already showed a toast; return the i18n key so callers can
    // display a localized message without duplicating the toast logic.
    return err.translationKey;
  }
  if (err instanceof BackendHttpError) {
    // Prefer the raw backend detail (e.g. "Invalid credentials") when present;
    // otherwise fall back to the i18n key so the caller can translate it.
    return err.detail ?? err.translationKey;
  }

  // Fallback path: raw RxJS / Angular types (unit tests, non-intercepted calls).
  if (err instanceof TimeoutError) {
    return 'ERRORS.timeout';
  }
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: unknown; detail?: unknown } | null;
    if (typeof body?.error === 'string') return body.error;
    const detail = body?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return (detail[0] as { msg?: string })?.msg ?? err.message ?? 'Unknown error';
    if (detail && typeof detail === 'object') return (detail as { error?: string }).error ?? err.message ?? 'Unknown error';
    return err.message ?? 'Unknown error';
  }
  return 'Unknown error';
}
