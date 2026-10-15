import { describe, expect, it } from 'vitest';
import en from '@book-club/i18n/en.icu.json';
import { describeError, isReported } from './describe-error';

const t = (key: string) => (en as Record<string, string>)[`ERRORS.${key}`] ?? key;
const http = (status: number, detail: string | null, translationKey = 'ERRORS.requestFailed') => Object.assign(new Error('x'), { name: 'BackendHttpError', status, detail, translationKey });

describe('describeError', () => {
  it('prefers the backend detail, then the localized status message', () => {
    expect(describeError(http(409, 'Club is full'), t)).toBe('Club is full');
    expect(describeError(http(404, null), t)).toBe(t('requestFailed'));
    expect(describeError(http(0, null, 'ERRORS.network'), t)).toBe(t('network'));
  });

  it('maps a 403 OWNER_ONLY to the owner-only message, and other 403s to their detail', () => {
    const owner = Object.assign(http(403, 'Only the club owner may do this'), { code: 'OWNER_ONLY' });
    expect(describeError(owner, t)).toBe(t('owner_only_action'));
    expect(describeError(Object.assign(http(403, 'Forbidden'), { code: 'FORBIDDEN' }), t)).toBe('Forbidden');
  });

  it('maps the 400 owner-leave and self-ban codes', () => {
    expect(describeError(Object.assign(http(400, 'x'), { code: 'OWNER_CANNOT_LEAVE' }), t)).toBe(t('owner_cannot_leave'));
    expect(describeError(Object.assign(http(400, 'x'), { code: 'CANNOT_BAN_SELF' }), t)).toBe(t('cannot_ban_self'));
    expect(describeError(Object.assign(http(400, 'Last organizer'), { code: 'LAST_ORGANIZER' }), t)).toBe('Last organizer');
  });

  it('maps a timeout and falls back to a plain message or the generic error', () => {
    expect(describeError(Object.assign(new Error('t'), { name: 'RequestTimeoutError' }), t)).toBe(t('timeout'));
    expect(describeError(new Error('boom'), t)).toBe('boom');
    expect(describeError('weird', t)).toBe(t('unexpected'));
    expect(describeError(null, t)).toBe(t('unexpected'));
  });
});

describe('isReported', () => {
  it('is true only for what the api client already toasted: timeouts and 5xx', () => {
    expect(isReported(http(500, null))).toBe(true);
    expect(isReported(http(503, 'x'))).toBe(true);
    expect(isReported(Object.assign(new Error('t'), { name: 'RequestTimeoutError' }))).toBe(true);
    expect(isReported(http(409, 'x'))).toBe(false);
    expect(isReported(http(0, null))).toBe(false);
    expect(isReported(new Error('x'))).toBe(false);
  });
});
