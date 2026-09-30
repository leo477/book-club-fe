'use client';

import { useSyncExternalStore } from 'react';

// an alert must outlive a slow reader; the banner also has a dismiss button
const DISMISS_MS = 12000;

let current: { clubId: string; message: string } | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function setActionError(clubId: string, next: string | null): void {
  clearTimeout(timer);
  current = next ? { clubId, message: next } : null;
  if (next) timer = setTimeout(() => setActionError(clubId, null), DISMISS_MS);
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** The join/leave failure banner is shared by the header and the join call-to-action, which sit apart in the layout; it belongs to one club. */
export const useActionError = (clubId: string): string | null =>
  useSyncExternalStore(subscribe, () => (current?.clubId === clubId ? current.message : null), () => null);
