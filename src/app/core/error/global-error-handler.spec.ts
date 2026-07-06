import { TestBed } from '@angular/core/testing';
import { isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { track } from '@vercel/analytics';
import { TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { GlobalErrorHandler } from './global-error-handler';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('@angular/core', async (importActual) => {
  const actual = await importActual<typeof import('@angular/core')>();
  return { ...actual, isDevMode: vi.fn(() => true) };
});

const mockTranslateService = { instant: (key: string) => key };

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        GlobalErrorHandler,
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    handler = TestBed.inject(GlobalErrorHandler);
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(toast, 'error').mockImplementation(() => '');
    vi.mocked(track).mockClear();
    vi.mocked(isDevMode).mockReturnValue(true);
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.mocked(toast.error).mockRestore();
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

  it('does not report telemetry in dev mode', () => {
    handler.handleError(new Error('boom'));
    expect(track).not.toHaveBeenCalled();
  });

  it('does not show a toast in dev mode', () => {
    handler.handleError(new Error('boom'));
    expect(toast.error).not.toHaveBeenCalled();
  });

  describe('in production', () => {
    beforeEach(() => {
      vi.mocked(isDevMode).mockReturnValue(false);
    });

    it('shows a generic toast instead of nothing', async () => {
      handler.handleError(new Error('boom'));
      await new Promise(resolve => setTimeout(resolve));
      expect(toast.error).toHaveBeenCalledWith('ERRORS.unexpected');
    });

    it('reports the Error message', () => {
      handler.handleError(new Error('boom'));
      expect(track).toHaveBeenCalledWith('client_error', { message: 'boom' });
    });

    it('reports a string error verbatim', () => {
      handler.handleError('string failure');
      expect(track).toHaveBeenCalledWith('client_error', { message: 'string failure' });
    });

    it('reports the message property of object errors', () => {
      handler.handleError({ message: 'object failure' });
      expect(track).toHaveBeenCalledWith('client_error', { message: 'object failure' });
    });

    it('stringifies errors with no message', () => {
      handler.handleError(42);
      expect(track).toHaveBeenCalledWith('client_error', { message: '42' });
    });
  });
});
