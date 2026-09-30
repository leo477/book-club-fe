'use client';

import { useSyncExternalStore } from 'react';

const DISMISS_MS = 5000;

let message: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function setActionError(next: string | null): void {
  clearTimeout(timer);
  message = next;
  if (next) timer = setTimeout(() => setActionError(null), DISMISS_MS);
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** The join/leave failure banner is shared by the header and the join call-to-action, which sit apart in the layout. */
export const useActionError = (): string | null => useSyncExternalStore(subscribe, () => message, () => null);
