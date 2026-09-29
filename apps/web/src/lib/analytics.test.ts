import { beforeEach, describe, expect, it, vi } from 'vitest';

const track = vi.hoisted(() => vi.fn());
vi.mock('@vercel/analytics', () => ({ track }));

import { bucketLabel, installErrorReporter, MAX_ERRORS_PER_PAGE, reportJsError, resetAnalyticsState, sanitizeMessage, trackCohortOnce, trackEvent } from './analytics';

const setCookie = (value: string) => {
  document.cookie = `bc_bucket=${value}; path=/`;
};

beforeEach(() => {
  track.mockReset();
  resetAnalyticsState();
  document.cookie = 'bc_bucket=; path=/; max-age=0';
});

describe('bucketLabel', () => {
  it.each([
    ['0', '0-9'],
    ['9', '0-9'],
    ['10', '10-19'],
    ['57', '50-59'],
    ['99', '90-99'],
  ])('maps %s to %s', (value, label) => expect(bucketLabel(value)).toBe(label));

  it.each([undefined, null, '', '100', 'abc', '-1'])('is null for %j', (value) => expect(bucketLabel(value)).toBeNull());
});

describe('trackEvent', () => {
  it('tags app and the cohort bucket from the cookie', () => {
    setCookie('42');
    trackEvent('join_club');
    expect(track).toHaveBeenCalledWith('join_club', { app: 'next', bucket: '40-49' });
  });

  it('sends a null bucket without the cookie and never throws', () => {
    trackEvent('x');
    expect(track).toHaveBeenCalledWith('x', { app: 'next', bucket: null });
    track.mockImplementation(() => {
      throw new Error('boom');
    });
    expect(() => trackEvent('y')).not.toThrow();
  });
});

describe('trackCohortOnce', () => {
  it('fires a single cohort event per page load', () => {
    setCookie('7');
    trackCohortOnce();
    trackCohortOnce();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('cohort', { app: 'next', bucket: '0-9' });
  });
});

describe('js_error reporter', () => {
  it('truncates and scrubs the message', () => {
    const long = `${'x'.repeat(500)}`;
    expect(sanitizeMessage(long)).toHaveLength(120);
    expect(sanitizeMessage('fetch https://a.b/c?token=1 failed for me@x.com id 1234567')).toBe('fetch <url> failed for <email> id <n>');
    expect(sanitizeMessage({ any: 'object' })).toBe('non-error');
  });

  it('reports window errors and unhandled rejections, at most N per page', () => {
    const off = installErrorReporter(window);
    window.dispatchEvent(new ErrorEvent('error', { message: 'bad thing', error: new Error('bad thing') }));
    const rejection = new Event('unhandledrejection') as PromiseRejectionEvent;
    Object.assign(rejection, { reason: new Error('nope') });
    window.dispatchEvent(rejection);
    expect(track).toHaveBeenNthCalledWith(1, 'js_error', { app: 'next', bucket: null, message: 'bad thing', kind: 'error' });
    expect(track).toHaveBeenNthCalledWith(2, 'js_error', { app: 'next', bucket: null, message: 'nope', kind: 'unhandledrejection' });

    for (let i = 0; i < 20; i++) reportJsError(`e${i}`);
    expect(track).toHaveBeenCalledTimes(MAX_ERRORS_PER_PAGE);
    off();
    window.dispatchEvent(new ErrorEvent('error', { message: 'after cleanup' }));
    expect(track).toHaveBeenCalledTimes(MAX_ERRORS_PER_PAGE);
  });
});
