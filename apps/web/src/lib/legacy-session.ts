import { resetSessionHint } from './session-hint';

const LEGACY_KEYS = ['bc_refresh_token', 'bc_has_session'] as const;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

let inflight: Promise<void> | null = null;

/**
 * One-release migration off the pre-cookie session (mirrors Angular AuthService.init): a browser that still holds the
 * old refresh token or marker sends it once to /auth/refresh so the backend sets the cookies, then both keys are
 * deleted whatever the outcome. The response is never read; JS only ever sends the legacy token, never receives one.
 */
export function migrateLegacySession(): Promise<void> {
  const refreshToken = read(LEGACY_KEYS[0]);
  if (refreshToken === null && read(LEGACY_KEYS[1]) === null) return Promise.resolve();
  inflight ??= fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  })
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      for (const key of LEGACY_KEYS) {
        try {
          localStorage.removeItem(key);
        } catch {
          // storage blocked: nothing to delete
        }
      }
      // a hint cached as "guest" before the cookies existed must not hide the migrated session
      resetSessionHint();
      inflight = null;
    });
  return inflight;
}
