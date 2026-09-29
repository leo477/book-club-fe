const MAX_AGE = 60 * 60 * 24 * 365;

export function writeCookie(name: string, value: string): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax${secure}`;
}

/** Cookie first (the server reads it); localStorage is a best-effort mirror that may throw (blocked storage, private mode). */
export function persistPreference(name: string, value: string): void {
  writeCookie(name, value);
  try {
    localStorage.setItem(name, value);
  } catch {
    // preference still applies through the cookie
  }
}
