import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setActionError, useActionError } from './action-error';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  act(() => setActionError('a', null));
  vi.useRealTimers();
});

describe('action error banner', () => {
  it('belongs to one club', () => {
    const a = renderHook(() => useActionError('a'));
    const b = renderHook(() => useActionError('b'));
    act(() => setActionError('a', 'Club is full'));
    expect(a.result.current).toBe('Club is full');
    expect(b.result.current).toBeNull();
  });

  it('is not dismissed within 10 s and goes away on its own afterwards', () => {
    const { result } = renderHook(() => useActionError('a'));
    act(() => setActionError('a', 'Club is full'));
    act(() => void vi.advanceTimersByTime(9999));
    expect(result.current).toBe('Club is full');
    act(() => void vi.advanceTimersByTime(3000));
    expect(result.current).toBeNull();
  });
});
