import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../services/toast.service';
import { CANARY_TRACK } from '../services/canary-analytics.service';
import { GlobalErrorHandler, IS_DEV_MODE } from './global-error-handler';

const track = vi.fn();
const isDevMode = vi.fn(() => true);
const mockTranslateService = { instant: (key: string) => key };

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        GlobalErrorHandler,
        { provide: IS_DEV_MODE, useValue: isDevMode },
        { provide: CANARY_TRACK, useValue: track },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    handler = TestBed.inject(GlobalErrorHandler);
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(TestBed.inject(ToastService), 'error').mockImplementation(() => undefined);
    track.mockClear();
    isDevMode.mockReturnValue(true);
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.mocked(TestBed.inject(ToastService).error).mockRestore();
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
    expect(TestBed.inject(ToastService).error).not.toHaveBeenCalled();
  });

  describe('in production', () => {
    beforeEach(() => {
      isDevMode.mockReturnValue(false);
    });

    it('shows a generic toast instead of nothing', async () => {
      handler.handleError(new Error('boom'));
      await new Promise(resolve => setTimeout(resolve));
      expect(TestBed.inject(ToastService).error).toHaveBeenCalledWith('ERRORS.unexpected');
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
