'use client';

import { useEffect } from 'react';
import { ErrorPanel } from '@/components/error-panel';
import { reportJsError } from '@/lib/analytics';

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // error boundaries swallow the error before window.onerror, so report it here
  useEffect(() => reportJsError(error, 'boundary'), [error]);
  return <ErrorPanel onRetry={reset} />;
}
