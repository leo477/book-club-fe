import { HttpErrorResponse } from '@angular/common/http';
import { extractApiError } from './api-error.util';
import { BackendHttpError, RequestTimeoutError } from '../interceptors/auth.interceptor';

describe('extractApiError', () => {
  // ── Interceptor-normalized types (primary path) ──────────────────────────

  it('returns the translation key for RequestTimeoutError', () => {
    expect(extractApiError(new RequestTimeoutError())).toBe('ERRORS.timeout');
  });

  it('returns backend detail from BackendHttpError when present', () => {
    const err = new BackendHttpError(500, 'Database unavailable', 'ERRORS.serverError');
    expect(extractApiError(err)).toBe('Database unavailable');
  });

  it('returns translation key from BackendHttpError when detail is null', () => {
    const err = new BackendHttpError(500, null, 'ERRORS.serverError');
    expect(extractApiError(err)).toBe('ERRORS.serverError');
  });

  it('returns detail from BackendHttpError with 4xx status', () => {
    const err = new BackendHttpError(401, 'Invalid credentials', 'ERRORS.requestFailed');
    expect(extractApiError(err)).toBe('Invalid credentials');
  });

  // ── Raw Angular / RxJS fallback types ────────────────────────────────────

  it('returns detail from HttpErrorResponse when present', () => {
    const err = new HttpErrorResponse({ error: { detail: 'Not found' }, status: 404 });
    expect(extractApiError(err)).toBe('Not found');
  });

  it('returns message from HttpErrorResponse when detail is absent', () => {
    const err = new HttpErrorResponse({ error: {}, status: 500, statusText: 'Server Error' });
    expect(extractApiError(err)).toContain('500');
  });

  it('returns Unknown error for plain Error object', () => {
    expect(extractApiError(new Error('oops'))).toBe('Unknown error');
  });

  it('returns Unknown error for null', () => {
    expect(extractApiError(null)).toBe('Unknown error');
  });

  it('returns Unknown error for string', () => {
    expect(extractApiError('error string')).toBe('Unknown error');
  });

  it('prefers detail over message in HttpErrorResponse', () => {
    const err = new HttpErrorResponse({
      error: { detail: 'Custom detail' },
      status: 400,
    });
    expect(extractApiError(err)).toBe('Custom detail');
  });

  it('returns first msg when detail is a validation error array', () => {
    const err = new HttpErrorResponse({
      error: { detail: [{ msg: 'field required' }, { msg: 'invalid value' }] },
      status: 422,
    });
    expect(extractApiError(err)).toBe('field required');
  });

  it('returns message when detail is an array with no msg', () => {
    const err = new HttpErrorResponse({
      error: { detail: [{}] },
      status: 422,
      statusText: 'Unprocessable Entity',
    });
    expect(extractApiError(err)).toContain('422');
  });

  it('returns error field when detail is an object with error property', () => {
    const err = new HttpErrorResponse({
      error: { detail: { error: 'account_disabled', code: 'AUTH_003' } },
      status: 403,
    });
    expect(extractApiError(err)).toBe('account_disabled');
  });

  it('returns message when detail is an object without error property', () => {
    const err = new HttpErrorResponse({
      error: { detail: { code: 'UNKNOWN' } },
      status: 403,
      statusText: 'Forbidden',
    });
    expect(extractApiError(err)).toContain('403');
  });

  it('returns error string from Book Club {error, code} shape (409)', () => {
    const err = new HttpErrorResponse({
      error: { error: 'Email already exists', code: 'EMAIL_EXISTS' },
      status: 409,
      statusText: 'Conflict',
    });
    expect(extractApiError(err)).toBe('Email already exists');
  });

  it('returns error string from Book Club {error, code} shape (401)', () => {
    const err = new HttpErrorResponse({
      error: { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      status: 401,
      statusText: 'Unauthorized',
    });
    expect(extractApiError(err)).toBe('Invalid credentials');
  });
});
