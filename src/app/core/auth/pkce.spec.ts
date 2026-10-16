import { describe, expect, it } from 'vitest';
import { beginPkce, deriveChallenge, takeVerifier } from './pkce';

describe('pkce', () => {
  it('derives the RFC 7636 example challenge', async () => {
    expect(await deriveChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('stores the verifier behind the challenge and takes it once', async () => {
    const challenge = await beginPkce();
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await deriveChallenge(takeVerifier() ?? '')).toBe(challenge);
    expect(takeVerifier()).toBeUndefined();
  });
});
