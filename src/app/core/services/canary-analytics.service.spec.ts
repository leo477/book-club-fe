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
