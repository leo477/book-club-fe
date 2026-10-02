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

    it('reports a sanitised js_error with kind error', () => {
      handler.handleError(new Error('boom at https://x.io/a for me@x.com'));
      expect(track).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith('js_error', {
        app: 'angular',
        bucket: null,
        message: 'boom at <url> for <email>',
        kind: 'error',
      });
    });

    it('reports string, object and primitive errors', () => {
      handler.handleError('string failure');
      handler.handleError({ message: 'object failure' });
      expect(track).toHaveBeenNthCalledWith(1, 'js_error', expect.objectContaining({ message: 'string failure' }));
      expect(track).toHaveBeenNthCalledWith(2, 'js_error', expect.objectContaining({ message: 'non-error' }));
    });

    it('never sends a name outside the contract', () => {
      handler.handleError(new Error('x'));
      expect(track.mock.calls.every(([name]) => name === 'js_error')).toBe(true);
    });
  });
});
