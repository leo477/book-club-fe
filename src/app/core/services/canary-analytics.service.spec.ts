import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  CANARY_TRACK,
  CanaryAnalyticsService,
  MAX_ERRORS_PER_PAGE,
  bucketLabel,
  sanitizeMessage,
} from './canary-analytics.service';

describe('bucketLabel', () => {
  it.each([
    ['0', '0-9'],
    ['47', '40-49'],
    ['99', '90-99'],
  ])('maps %s to %s', (value, label) => expect(bucketLabel(value)).toBe(label));

  it.each([null, undefined, '', 'abc', '100', '-1'])('returns null for %s', (value) =>
    expect(bucketLabel(value)).toBeNull(),
  );
});

describe('sanitizeMessage', () => {
  it('scrubs urls, emails and long digit runs', () => {
    expect(sanitizeMessage('fail https://a.b/c?x=1 for me@x.com id 123456 and 1234')).toBe(
      'fail <url> for <email> id <n> and 1234',
    );
  });

  it('truncates to 120 chars and handles non-errors', () => {
    expect(sanitizeMessage('x'.repeat(300))).toHaveLength(120);
    expect(sanitizeMessage(new Error('boom'))).toBe('boom');
    expect(sanitizeMessage({})).toBe('non-error');
  });
});

describe('CanaryAnalyticsService', () => {
  let service: CanaryAnalyticsService;
  const track = vi.fn();

  beforeEach(() => {
    track.mockReset();
    document.cookie = 'bc_bucket=42';
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), { provide: CANARY_TRACK, useValue: track }] });
    service = TestBed.inject(CanaryAnalyticsService);
  });

  afterEach(() => {
    document.cookie = 'bc_bucket=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('emits cohort once with app and bucket', () => {
    service.start();
    service.start();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('cohort', { app: 'angular', bucket: '40-49' });
  });

  it('caps js_error per page load', () => {
    for (let i = 0; i < MAX_ERRORS_PER_PAGE + 3; i++) service.reportJsError(new Error('e'));
    expect(track).toHaveBeenCalledTimes(MAX_ERRORS_PER_PAGE);
    expect(track).toHaveBeenCalledWith('js_error', { app: 'angular', bucket: '40-49', message: 'e', kind: 'error' });
  });

  it('never throws when track fails', () => {
    track.mockImplementation(() => {
      throw new Error('x');
    });
    expect(() => service.trackEvent('cohort')).not.toThrow();
  });
});

describe('default CANARY_TRACK sender', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'bc_bucket=7';
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = 'bc_bucket=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('posts the exact cohort body first-party with keepalive and no credentials', () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    TestBed.inject(CanaryAnalyticsService).start();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/analytics/event');
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      credentials: 'omit',
    });
    expect(JSON.parse(init.body)).toEqual({ app: 'angular', name: 'cohort', bucket: '0-9' });
  });

  it('posts js_error with kind and message', () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    TestBed.inject(CanaryAnalyticsService).reportJsError(new Error('boom'), 'unhandledrejection');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      app: 'angular',
      name: 'js_error',
      bucket: '0-9',
      kind: 'unhandledrejection',
      message: 'boom',
    });
  });

  it('swallows rejected and throwing fetches without retrying', async () => {
    const service = TestBed.inject(CanaryAnalyticsService);
    fetchMock.mockRejectedValue(new Error('offline'));
    expect(() => service.trackEvent('join_club')).not.toThrow();
    await Promise.resolve();
    fetchMock.mockImplementation(() => {
      throw new Error('sync');
    });
    expect(() => service.trackEvent('join_club')).not.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('caps js_error requests per page', () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const service = TestBed.inject(CanaryAnalyticsService);
    for (let i = 0; i < MAX_ERRORS_PER_PAGE + 4; i++) service.reportJsError(new Error('e'));
    expect(fetchMock).toHaveBeenCalledTimes(MAX_ERRORS_PER_PAGE);
  });
});
