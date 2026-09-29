export type ToastKind = 'success' | 'error' | 'info';
type Sink = (kind: ToastKind, message: string) => void;

// The Toaster (and sonner with it) is loaded on the first toast, so messages wait here until it mounts.
const queue: [ToastKind, string][] = [];
let sink: Sink | null = null;
let wake: (() => void) | null = null;

export function showToast(kind: ToastKind, message: string): void {
  if (sink) return sink(kind, message);
  queue.push([kind, message]);
  wake?.();
}

/** Called by the lazy host: `onFirst` mounts the Toaster; returns the queue's pending state. */
export function onFirstToast(onFirst: () => void): () => void {
  wake = onFirst;
  if (queue.length > 0) onFirst();
  return () => {
    wake = null;
  };
}

/** Called by the mounted Toaster: drains the queue, then receives toasts directly. */
export function attachToastSink(next: Sink): () => void {
  sink = next;
  for (const [kind, message] of queue.splice(0)) next(kind, message);
  return () => {
    sink = null;
  };
}
