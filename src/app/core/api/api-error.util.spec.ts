import { HttpErrorResponse } from '@angular/common/http';
import { extractApiError } from './api-error.util';

describe('extractApiError', () => {
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
});
