import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), GlobalErrorHandler],
    });
    handler = TestBed.inject(GlobalErrorHandler);
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('logs the error to the console', () => {
    const error = new Error('boom');
    handler.handleError(error);
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it('logs non-Error values', () => {
    handler.handleError('plain string error');
    expect(consoleError).toHaveBeenCalledWith('plain string error');
  });

  it('does not throw when reporting fails', () => {
    expect(() => handler.handleError({ message: 'weird' })).not.toThrow();
    expect(consoleError).toHaveBeenCalled();
  });

  it('does not throw on null/undefined errors', () => {
    expect(() => handler.handleError(null)).not.toThrow();
    expect(() => handler.handleError(undefined)).not.toThrow();
  });
});
