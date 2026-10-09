const KEY = 'bc_flash';

/** A one-shot notice that must outlive a hard navigation. Only this fixed key is ever stored: no free text, no tokens, nothing a URL can set. */
export type Flash = 'oauth_failed';

export function setFlash(flash: Flash): void {
  try {
    sessionStorage.setItem(KEY, flash);
  } catch {
    // storage blocked: the notice is simply lost
  }
}

export function takeFlash(): Flash | null {
  try {
    const value = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return value === 'oauth_failed' ? value : null;
  } catch {
    return null;
  }
}
