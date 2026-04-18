import { HttpErrorResponse } from '@angular/common/http';

export function extractApiError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return (err.error as { detail?: string })?.detail ?? err.message ?? 'Unknown error';
  }
  return 'Unknown error';
}
