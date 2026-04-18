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
});
