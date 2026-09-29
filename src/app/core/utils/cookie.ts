const MAX_AGE = 60 * 60 * 24 * 365;

export function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  try {
    for (const part of document.cookie.split(';')) {
      const entry = part.trim();
      if (entry.startsWith(prefix)) return decodeURIComponent(entry.slice(prefix.length));
    }
  } catch {
    return null;
  }
  return null;
}

export function writeCookie(name: string, value: string): void {
  const secure = globalThis.location?.protocol === 'https:' ? '; Secure' : '';
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    /* cookies unavailable */
  }
}
