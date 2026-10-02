import { Injectable } from '@angular/core';
import { GlobalErrorHandler } from './global-error-handler';

@Injectable()
export class CanaryErrorHandler extends GlobalErrorHandler {
  protected override report(error: unknown): void {
    this.canary.reportJsError(error, 'error');
  }
}
