import { describe, expect, it } from 'vitest';
import { backendApiUrl, backendOrigin } from './backend-origin';

const prod = { NODE_ENV: 'production' };

describe('backendOrigin', () => {
  it('defaults to the hosted backend', () => {
    expect(backendOrigin(prod)).toBe('https://book-club-be.onrender.com');
    expect(backendApiUrl(prod)).toBe('https://book-club-be.onrender.com/api/v1');
  });

  it('normalizes to the origin and accepts the legacy BACKEND_API_URL', () => {
    expect(backendOrigin({ ...prod, BACKEND_ORIGIN: 'https://api.example.com/some/path' })).toBe('https://api.example.com');
    expect(backendOrigin({ ...prod, BACKEND_API_URL: 'https://api.example.com/api/v1' })).toBe('https://api.example.com');
    expect(backendOrigin({ ...prod, BACKEND_ORIGIN: 'https://a.example.com', BACKEND_API_URL: 'https://b.example.com' })).toBe('https://a.example.com');
  });

  it('fails closed in production on http, other schemes and garbage', () => {
    for (const bad of ['http://api.example.com', 'ftp://api.example.com', 'javascript:alert(1)', 'not a url']) {
      expect(() => backendOrigin({ ...prod, BACKEND_ORIGIN: bad })).toThrow();
    }
  });

  it('allows http only outside production', () => {
    expect(backendOrigin({ NODE_ENV: 'development', BACKEND_ORIGIN: 'http://localhost:8000' })).toBe('http://localhost:8000');
    expect(() => backendOrigin({ NODE_ENV: 'development', BACKEND_ORIGIN: 'ftp://x' })).toThrow();
  });
});
