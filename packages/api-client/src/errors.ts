export const ERROR_KEYS = {
  timeout: 'ERRORS.timeout',
  serverError: 'ERRORS.serverError',
  network: 'ERRORS.network',
  requestFailed: 'ERRORS.requestFailed',
} as const;

export function translationKeyForStatus(status: number): string {
  if (status >= 500) return ERROR_KEYS.serverError;
  if (status === 0) return ERROR_KEYS.network;
  return ERROR_KEYS.requestFailed;
}

/** The frontend's own request timeout fired before the backend responded. */
export class RequestTimeoutError extends Error {
  readonly translationKey = ERROR_KEYS.timeout;
  constructor() {
    super(ERROR_KEYS.timeout);
    this.name = 'RequestTimeoutError';
  }
}

/** A backend HTTP error (4xx/5xx) or a network failure (status 0). */
export class BackendHttpError extends Error {
  readonly status: number;
  readonly detail: string | null;
  readonly translationKey: string;
  constructor(status: number, detail: string | null, translationKey: string) {
    super(detail ?? translationKey);
    this.name = 'BackendHttpError';
    this.status = status;
    this.detail = detail;
    this.translationKey = translationKey;
  }
}

function nonEmpty(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function extractBackendDetail(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === 'string') return nonEmpty(body);
  if (typeof body !== 'object') return null;
  const b = body as { detail?: unknown; message?: unknown; error?: unknown };
  const candidate = b.detail ?? b.message ?? b.error;
  const direct = nonEmpty(candidate);
  if (direct) return direct;
  if (typeof candidate === 'object' && candidate !== null) {
    const c = candidate as { error?: unknown; message?: unknown };
    return nonEmpty(c.error ?? c.message);
  }
  return null;
}

/** Message or translation key suitable for surfacing to the user. */
export function extractApiError(err: unknown): string {
  if (err instanceof RequestTimeoutError) return err.translationKey;
  if (err instanceof BackendHttpError) return err.detail ?? err.translationKey;
  return 'Unknown error';
}
