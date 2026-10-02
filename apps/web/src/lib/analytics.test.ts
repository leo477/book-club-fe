import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();
vi.mock('@vercel/analytics', () => ({ track: () => expect.unreachable('Vercel track must not be used') }));

const sent = (n = 0) => JSON.parse(fetchMock.mock.calls[n]![1].body);

import { bucketLabel, installErrorReporter, MAX_ERRORS_PER_PAGE, reportJsError, resetAnalyticsState, sanitizeMessage, trackCohortOnce, trackEvent } from './analytics';

const setCookie = (value: string) => {
  document.cookie = `bc_bucket=${value}; path=/`;
};

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);
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
  it('posts the exact body to the first-party endpoint', () => {
    setCookie('42');
    trackEvent('join_club');
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/analytics/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ app: 'next', name: 'join_club', bucket: '40-49' }),
      keepalive: true,
      credentials: 'omit',
    });
  });

  it('sends a null bucket without the cookie', () => {
    trackEvent('cohort');
    expect(sent()).toEqual({ app: 'next', name: 'cohort', bucket: null });
  });

  it('swallows sync throws and rejections without retrying', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect(() => trackEvent('cohort')).not.toThrow();
    await Promise.resolve();
    fetchMock.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    expect(() => trackEvent('cohort')).not.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('trackCohortOnce', () => {
  it('fires a single cohort event per page load', () => {
    setCookie('7');
    trackCohortOnce();
    trackCohortOnce();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sent()).toEqual({ app: 'next', name: 'cohort', bucket: '0-9' });
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
    expect(sent(0)).toEqual({ app: 'next', name: 'js_error', bucket: null, kind: 'error', message: 'bad thing' });
    expect(sent(1)).toEqual({ app: 'next', name: 'js_error', bucket: null, kind: 'unhandledrejection', message: 'nope' });

    for (let i = 0; i < 20; i++) reportJsError(`e${i}`);
    expect(fetchMock).toHaveBeenCalledTimes(MAX_ERRORS_PER_PAGE);
    off();
    window.dispatchEvent(new ErrorEvent('error', { message: 'after cleanup' }));
    expect(fetchMock).toHaveBeenCalledTimes(MAX_ERRORS_PER_PAGE);
  });
});
