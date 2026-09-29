import type { AuthTokens } from '@book-club/contracts';
import type { BackendHttpError, RequestTimeoutError } from './errors';

type MaybePromise<T> = T | Promise<T>;

export interface Transport {
  readonly credentials?: RequestCredentials;
  /** Bearer token to attach, or null when the transport never sets Authorization. */
  getAccessToken(): MaybePromise<string | null>;
  /** Whether a 401 means "session expired" (refresh, then log out) rather than "guest". */
  hasSession(): MaybePromise<boolean>;
  /** JSON body for POST /auth/refresh, or null when no refresh is possible. */
  getRefreshBody(): MaybePromise<Record<string, unknown> | null>;
  storeTokens(tokens: AuthTokens): MaybePromise<void>;
  clear(): MaybePromise<void>;
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  /** Public endpoint / auth-flow request: no refresh-and-replay, no logout or forbidden redirect. */
  skipAuthRedirect?: boolean;
  /** Background request: report failures to onError with `suppress: true`. */
  suppressErrorToast?: boolean;
}

export type ApiClientError = BackendHttpError | RequestTimeoutError;

export interface ApiClientConfig {
  baseUrl: string;
  transport: Transport;
  /** Session is gone (refresh failed, or an authenticated request still got 401). */
  onUnauthenticated?: () => void;
  /** Authenticated but forbidden (403). */
  onForbidden?: () => void;
  /** Timeouts and 5xx; `suppress` mirrors suppressErrorToast. */
  onError?: (error: ApiClientError, info: { suppress: boolean; path: string; method: string }) => void;
  fetch?: typeof fetch;
  getTimeoutMs?: number;
  mutationTimeoutMs?: number;
  retry503DelayMs?: number;
}
