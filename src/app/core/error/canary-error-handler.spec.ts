import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CANARY_TRACK, MAX_ERRORS_PER_PAGE } from '../services/canary-analytics.service';
import { CanaryErrorHandler } from './canary-error-handler';

describe('CanaryErrorHandler', () => {
  it('delegates to the default handler and reports js_error', () => {
    const track = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CanaryErrorHandler,
        { provide: CANARY_TRACK, useValue: track },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    });
    const error = new Error('boom');
    TestBed.inject(CanaryErrorHandler).handleError(error);
    expect(consoleError).toHaveBeenCalledWith(error);
    expect(track).toHaveBeenCalledWith('js_error', { app: 'angular', bucket: null, message: 'boom', kind: 'error' });
    consoleError.mockRestore();
  });

  it('yields one js_error per handleError call and caps at 5', () => {
    const track = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CanaryErrorHandler,
        { provide: CANARY_TRACK, useValue: track },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    });
    const handler = TestBed.inject(CanaryErrorHandler);
    handler.handleError(new Error('one'));
    expect(track).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 9; i++) handler.handleError(new Error('more'));
    expect(MAX_ERRORS_PER_PAGE).toBe(5);
    expect(track).toHaveBeenCalledTimes(5);
    consoleError.mockRestore();
  });
});
