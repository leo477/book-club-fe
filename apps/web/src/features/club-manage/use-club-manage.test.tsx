import { act, renderHook, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nest } from '@/i18n/locale';
import { messages } from '@/test/harness';
import { gate } from './test-support';
import { isAbort, useGuardedRunner } from './use-club-manage';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
beforeEach(() => toast.mockReset());

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
    {children}
  </NextIntlClientProvider>
);

describe('useGuardedRunner', () => {
  it('runs one task per key even when called twice before React re-renders', async () => {
    const { result } = renderHook(() => useGuardedRunner(), { wrapper });
    const { open, release } = gate();
    const task = vi.fn(() => open);
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    await act(async () => {
      first = result.current.run('u1', task);
      second = result.current.run('u1', task);
    });
    expect(task).toHaveBeenCalledTimes(1);
    expect(result.current.busy.has('u1')).toBe(true);
    release();
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(false);
    await waitFor(() => expect(result.current.busy.size).toBe(0));
  });

  it('lets different keys run side by side and the same key again once it settled', async () => {
    const { result } = renderHook(() => useGuardedRunner(), { wrapper });
    const task = vi.fn(async () => undefined);
    await act(async () => {
      await Promise.all([result.current.run('a', task), result.current.run('b', task)]);
      await result.current.run('a', task);
    });
    expect(task).toHaveBeenCalledTimes(3);
  });

  it('toasts a failure and frees the key for a retry', async () => {
    const { result } = renderHook(() => useGuardedRunner(), { wrapper });
    await act(async () => {
      await expect(result.current.run('a', () => Promise.reject(new Error('boom')))).resolves.toBe(false);
    });
    expect(toast).toHaveBeenCalledWith('error', 'boom');
    await act(async () => {
      await expect(result.current.run('a', async () => undefined)).resolves.toBe(true);
    });
  });

  it('stays silent for an aborted request', async () => {
    const { result } = renderHook(() => useGuardedRunner(), { wrapper });
    await act(async () => {
      await result.current.run('a', () => Promise.reject(new DOMException('Aborted', 'AbortError')));
    });
    expect(toast).not.toHaveBeenCalled();
  });

  it('stays silent when the component left before the request failed', async () => {
    const { result, unmount } = renderHook(() => useGuardedRunner(), { wrapper });
    const { open, release } = gate();
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.run('a', async () => {
        await open;
        throw new Error('late');
      });
    });
    unmount();
    release();
    await expect(pending).resolves.toBe(false);
    expect(toast).not.toHaveBeenCalled();
  });
});

describe('isAbort', () => {
  it('recognises only AbortError', () => {
    expect(isAbort(new DOMException('x', 'AbortError'))).toBe(true);
    expect(isAbort(new Error('x'))).toBe(false);
    expect(isAbort(null)).toBe(false);
  });
});
