const KEY = 'bc_pkce_verifier';

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function deriveChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

/** Stores a fresh verifier and returns its challenge; null (unbound flow) when storage or crypto is unavailable. */
export async function beginPkce(): Promise<string | null> {
  try {
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = await deriveChallenge(verifier);
    sessionStorage.setItem(KEY, verifier);
    return challenge;
  } catch {
    return null;
  }
}

/** One-shot: the verifier is removed as it is read, whatever the exchange outcome. */
export function takeVerifier(): string | undefined {
  try {
    const verifier = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return verifier ?? undefined;
  } catch {
    return undefined;
  }
}
