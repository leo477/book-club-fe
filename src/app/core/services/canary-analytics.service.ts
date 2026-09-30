import { DOCUMENT, Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { track } from '@vercel/analytics';

type Props = Record<string, string | number | boolean | null>;
export type JsErrorKind = 'error' | 'unhandledrejection' | 'boundary';

export const CANARY_TRACK = new InjectionToken<typeof track>('CANARY_TRACK', {
  providedIn: 'root',
  factory: () => track,
});

export const MAX_ERRORS_PER_PAGE = 5;
const MAX_MESSAGE = 120;

export function bucketLabel(value: string | null | undefined): string | null {
  if (value == null || !/^\d{1,2}$/.test(value)) return null;
  const start = Math.floor(Number(value) / 10) * 10;
  return `${start}-${start + 9}`;
}

export function sanitizeMessage(raw: unknown): string {
  const text = raw instanceof Error ? raw.message : typeof raw === 'string' ? raw : 'non-error';
  return text
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/[^\s@]+@[^\s@]+/g, '<email>')
    .replace(/\d{5,}/g, '<n>')
    .slice(0, MAX_MESSAGE);
}

@Injectable({ providedIn: 'root' })
export class CanaryAnalyticsService {
  private readonly doc = inject(DOCUMENT);
  private readonly track = inject(CANARY_TRACK);
  private readonly isBrowser = inject(PLATFORM_ID) === 'browser';
  private errorsSent = 0;
  private started = false;

  start(): void {
    if (!this.isBrowser || this.started) return;
    this.started = true;
    this.trackEvent('cohort');
  }

  trackEvent(name: string, props: Props = {}): void {
    if (!this.isBrowser) return;
    try {
      this.track(name, { app: 'angular', bucket: bucketLabel(this.readBucketCookie()), ...props });
    } catch {
      // analytics must never break the page
    }
  }

  reportJsError(raw: unknown, kind: JsErrorKind = 'error'): void {
    if (!this.isBrowser || this.errorsSent >= MAX_ERRORS_PER_PAGE) return;
    this.errorsSent++;
    this.trackEvent('js_error', { message: sanitizeMessage(raw), kind });
  }

  private readBucketCookie(): string | undefined {
    try {
      return /(?:^|;\s*)bc_bucket=(\d{1,2})(?:;|$)/.exec(this.doc.cookie)?.[1];
    } catch {
      return undefined;
    }
  }
}
