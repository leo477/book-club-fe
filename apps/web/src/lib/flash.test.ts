import { beforeEach, describe, expect, it } from 'vitest';
import { setFlash, takeFlash } from './flash';

beforeEach(() => sessionStorage.clear());

describe('flash', () => {
  it('is read once and then gone', () => {
    setFlash('oauth_failed');
    expect(takeFlash()).toBe('oauth_failed');
    expect(takeFlash()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('ignores and clears anything that is not a known key', () => {
    sessionStorage.setItem('bc_flash', '<img src=x onerror=alert(1)>');
    expect(takeFlash()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
