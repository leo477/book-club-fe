import { BackendHttpError, ERROR_KEYS, RequestTimeoutError } from '@book-club/api-client';

/** The backend's own message when it sent one (as Angular showed it), else the localized fallback for the failure kind. */
export function authErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof BackendHttpError) return error.detail ?? t(error.translationKey);
  if (error instanceof RequestTimeoutError) return t(error.translationKey);
  return t(ERROR_KEYS.requestFailed);
}
