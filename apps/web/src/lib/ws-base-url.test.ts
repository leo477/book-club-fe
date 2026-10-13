import { describe, expect, it } from 'vitest';
import { checkWsBaseUrl } from './ws-base-url';

const WS = 'wss://book-club-be.onrender.com/api/v1';

describe('checkWsBaseUrl', () => {
  it('requires the variable in a production build', () => {
    expect(() => checkWsBaseUrl({ NODE_ENV: 'production' })).toThrow(/NEXT_PUBLIC_WS_URL is required/);
    expect(() => checkWsBaseUrl({ VERCEL_ENV: 'production', NEXT_PUBLIC_WS_URL: '' })).toThrow(/is required/);
  });

  it('lets development run without it', () => {
    expect(checkWsBaseUrl({ NODE_ENV: 'development' })).toBeNull();
  });

  it('accepts wss in production and ws only outside it', () => {
    expect(checkWsBaseUrl({ NODE_ENV: 'production', NEXT_PUBLIC_WS_URL: WS })).toBe(WS);
    expect(() => checkWsBaseUrl({ NODE_ENV: 'production', NEXT_PUBLIC_WS_URL: 'ws://x.test/api/v1' })).toThrow(/must be wss/);
    expect(checkWsBaseUrl({ NODE_ENV: 'development', NEXT_PUBLIC_WS_URL: 'ws://localhost:8000/api/v1' })).toBe('ws://localhost:8000/api/v1');
    expect(() => checkWsBaseUrl({ NODE_ENV: 'production', NEXT_PUBLIC_WS_URL: 'https://x.test' })).toThrow(/must be wss/);
  });

  it('in production the host must be the one the CSP connect-src allows', () => {
    expect(() => checkWsBaseUrl({ NODE_ENV: 'production', NEXT_PUBLIC_WS_URL: 'wss://other-backend.example.com/api/v1' })).toThrow(/CSP connect-src/);
    expect(() => checkWsBaseUrl({ VERCEL_ENV: 'production', NEXT_PUBLIC_WS_URL: 'wss://book-club-be.onrender.com.evil.test/api/v1' })).toThrow(/CSP connect-src/);
    expect(checkWsBaseUrl({ NODE_ENV: 'development', NEXT_PUBLIC_WS_URL: 'wss://other-backend.example.com/api/v1' })).toBe('wss://other-backend.example.com/api/v1');
  });

  it('rejects malformed values, trailing slashes, queries and fragments', () => {
    expect(() => checkWsBaseUrl({ NEXT_PUBLIC_WS_URL: 'nope' })).toThrow(/not a valid absolute URL/);
    expect(() => checkWsBaseUrl({ NEXT_PUBLIC_WS_URL: `${WS}/` })).toThrow(/no trailing slash/);
    expect(() => checkWsBaseUrl({ NEXT_PUBLIC_WS_URL: `${WS}?a=1` })).toThrow(/no trailing slash/);
  });
});
