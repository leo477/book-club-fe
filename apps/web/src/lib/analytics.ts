import { track } from '@vercel/analytics';
import { BUCKET_COOKIE, validBucket } from '@/strangler/config';

type Props = Record<string, string | number | boolean | null>;

/** bc_bucket (0-99) as a coarse cohort label such as "0-9"; null when the cookie is absent or invalid. */
export function bucketLabel(value: string | null | undefined): string | null {
  const bucket = validBucket(value);
  if (bucket === null) return null;
  const start = Math.floor(bucket / 10) * 10;
  return `${start}-${start + 9}`;
}

function readBucketCookie(): string | undefined {
  try {
    return document.cookie.match(new RegExp(`(?:^|;\\s*)${BUCKET_COOKIE}=(\\d{1,2})(?:;|$)`))?.[1];
  } catch {
    return undefined;
  }
}

/** Every custom event carries the front (`app: 'next'`) and the rollout cohort so Vercel Analytics can split canary vs control. */
export function trackEvent(name: string, props: Props = {}): void {
  try {
    track(name, { app: 'next', bucket: bucketLabel(readBucketCookie()), ...props });
  } catch {
    // analytics must never break the page
  }
}

let cohortSent = false;
/** Page views carry no custom properties, so one cohort event per hard load ties the session to its bucket. */
export function trackCohortOnce(): void {
  if (cohortSent) return;
  cohortSent = true;
  trackEvent('cohort');
}

export const MAX_ERRORS_PER_PAGE = 5;
const MAX_MESSAGE = 120;
let errorsSent = 0;

/** Strips URLs, emails and long digit runs (PII / ids), then truncates. */
export function sanitizeMessage(raw: unknown): string {
  const text = raw instanceof Error ? raw.message : typeof raw === 'string' ? raw : 'non-error';
  return text
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/[^\s@]+@[^\s@]+/g, '<email>')
    .replace(/\d{5,}/g, '<n>')
    .slice(0, MAX_MESSAGE);
}

export function reportJsError(raw: unknown, kind: 'error' | 'unhandledrejection' | 'boundary' = 'error'): void {
  if (errorsSent >= MAX_ERRORS_PER_PAGE) return;
  errorsSent++;
  trackEvent('js_error', { message: sanitizeMessage(raw), kind });
}

/** Installs the window reporters once; returns the cleanup. */
export function installErrorReporter(target: Window = window): () => void {
  const onError = (e: ErrorEvent) => reportJsError(e.error ?? e.message, 'error');
  const onRejection = (e: PromiseRejectionEvent) => reportJsError(e.reason, 'unhandledrejection');
  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
  };
}

/** Test seam: page-scoped counters live in module state. */
export function resetAnalyticsState(): void {
  cohortSent = false;
  errorsSent = 0;
}
