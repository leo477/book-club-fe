import { afterEach, describe, expect, it, vi } from 'vitest';
import { beginPkce, deriveChallenge, generateVerifier, takeVerifier } from './pkce';

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe('pkce', () => {
  it('derives the RFC 7636 example challenge', async () => {
    expect(await deriveChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('generates a 43-char base64url verifier', () => {
    expect(generateVerifier()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('stores the verifier behind the returned challenge and takes it exactly once', async () => {
    const challenge = await beginPkce();
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const verifier = takeVerifier();
    expect(await deriveChallenge(verifier!)).toBe(challenge);
    expect(takeVerifier()).toBeUndefined();
  });

  it('falls back to the unbound flow when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(await beginPkce()).toBeNull();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(takeVerifier()).toBeUndefined();
  });
});
