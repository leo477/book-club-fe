import { HttpErrorResponse } from '@angular/common/http';

export function extractApiError(err: unknown): string {
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
