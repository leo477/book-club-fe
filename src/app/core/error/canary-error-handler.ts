import { Injectable, inject } from '@angular/core';
import { CanaryAnalyticsService } from '../services/canary-analytics.service';
import { GlobalErrorHandler } from './global-error-handler';

@Injectable()
export class CanaryErrorHandler extends GlobalErrorHandler {
  private readonly canary = inject(CanaryAnalyticsService);

  override handleError(error: unknown): void {
    super.handleError(error);
    this.canary.reportJsError(error, 'error');
  }
}
