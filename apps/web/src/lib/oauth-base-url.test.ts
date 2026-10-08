import { describe, expect, it } from 'vitest';
import { checkOAuthBaseUrl } from './oauth-base-url';

const API = 'https://book-club-be.onrender.com/api/v1';

describe('checkOAuthBaseUrl', () => {
  it.each([
    ['NODE_ENV=production', { NODE_ENV: 'production' }],
    ['VERCEL_ENV=production', { VERCEL_ENV: 'production' }],
    ['empty value in production', { NODE_ENV: 'production', NEXT_PUBLIC_OAUTH_BASE_URL: '' }],
  ])('fails the build when it is missing: %s', (_name, env) => {
    expect(() => checkOAuthBaseUrl(env)).toThrow(/NEXT_PUBLIC_OAUTH_BASE_URL is required/);
  });

  it('lets development and test builds go without it', () => {
    expect(checkOAuthBaseUrl({ NODE_ENV: 'development' })).toBeNull();
    expect(checkOAuthBaseUrl({})).toBeNull();
  });

  it('accepts an absolute https URL and, outside production, http', () => {
    expect(checkOAuthBaseUrl({ NODE_ENV: 'production', NEXT_PUBLIC_OAUTH_BASE_URL: API })).toBe(API);
    expect(checkOAuthBaseUrl({ NODE_ENV: 'development', NEXT_PUBLIC_OAUTH_BASE_URL: 'http://localhost:8000/api/v1' })).toBe('http://localhost:8000/api/v1');
  });

  it.each([
    ['relative', '/api/v1'],
    ['http in production', 'http://book-club-be.onrender.com/api/v1'],
    ['trailing slash', `${API}/`],
    ['query', `${API}?x=1`],
  ])('rejects a malformed production value: %s', (_name, value) => {
    expect(() => checkOAuthBaseUrl({ NODE_ENV: 'production', NEXT_PUBLIC_OAUTH_BASE_URL: value })).toThrow();
  });
});
