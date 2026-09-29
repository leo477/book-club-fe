'use client';

import { useEffect } from 'react';
import { installErrorReporter, trackCohortOnce } from '@/lib/analytics';

/** Canary instrumentation: cohort tag per page load plus the js_error reporter. Renders nothing. */
export function AnalyticsEvents() {
  useEffect(() => {
    trackCohortOnce();
    return installErrorReporter();
  }, []);
  return null;
}
