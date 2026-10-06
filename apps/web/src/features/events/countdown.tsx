'use client';

import { useSyncExternalStore } from 'react';

export function formatCountdown(diffMs: number): string {
  if (!(diffMs > 0)) return '';
  const d = Math.floor(diffMs / 86_400_000);
  const h = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  const s = Math.floor((diffMs % 60_000) / 1000);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

/** The text is derived from the clock on every tick; it is empty once the event has started. */
export function EventCountdown({ eventDate, label }: { eventDate: string; label?: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => formatCountdown(new Date(eventDate).getTime() - Date.now()),
    () => '',
  );
  return (
    <span role="timer" aria-label={label} className="text-sm font-mono text-destructive">
      {text}
    </span>
  );
}
