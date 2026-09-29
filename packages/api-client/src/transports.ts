import type { AuthTokens } from '@book-club/contracts';
import type { Transport } from './types';

export interface CookieTransportOptions {
  /** Required: guests must not trigger refresh/redirect (e.g. cached /auth/session-status). */
  hasSession: () => boolean | Promise<boolean>;
}

/** Web: httpOnly cookies carry the session; JS never sees or sends a token. */
export function cookieTransport(options: CookieTransportOptions): Transport {
  return {
    credentials: 'include',
    getAccessToken: () => null,
    hasSession: options.hasSession,
    getRefreshBody: () => ({}),
    storeTokens: () => undefined,
    clear: () => undefined,
  };
}

export interface BearerTransportOptions {
  getToken: () => string | null | Promise<string | null>;
  getRefreshToken: () => string | null | Promise<string | null>;
  setTokens: (tokens: AuthTokens) => void | Promise<void>;
  clearTokens: () => void | Promise<void>;
}

/** Mobile: access token in the Authorization header, refresh token in the refresh body. */
export function bearerTransport(options: BearerTransportOptions): Transport {
  return {
    getAccessToken: options.getToken,
    hasSession: async () => (await options.getToken()) !== null,
    getRefreshBody: async () => {
      const refreshToken = await options.getRefreshToken();
      return refreshToken ? { refreshToken } : null;
    },
    storeTokens: options.setTokens,
    clear: options.clearTokens,
  };
}
