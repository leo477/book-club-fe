import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventCountdown, formatCountdown } from './countdown';

const NOW = new Date('2030-01-01T12:00:00Z');
const at = (offsetMs: number) => new Date(NOW.getTime() + offsetMs).toISOString();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe('formatCountdown', () => {
  it('splits the difference into days, hours, minutes and seconds', () => {
    expect(formatCountdown(2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5000 + 999)).toBe('2d 3h 4m 5s');
    expect(formatCountdown(1000)).toBe('0d 0h 0m 1s');
    expect(formatCountdown(999)).toBe('0d 0h 0m 0s');
  });

  it.each([0, -1, -86_400_000])('is empty for a zero or negative difference (%i)', (diff) => {
    expect(formatCountdown(diff)).toBe('');
  });
});

describe('EventCountdown', () => {
  it('renders the remaining time and ticks every second', () => {
    const { container } = render(<EventCountdown eventDate={at(3 * 1000 + 61_000)} />);
    const text = () => container.textContent;
    expect(text()).toBe('0d 0h 1m 4s');
    act(() => void vi.advanceTimersByTime(1000));
    expect(text()).toBe('0d 0h 1m 3s');
    act(() => void vi.advanceTimersByTime(3000));
    expect(text()).toBe('0d 0h 1m 0s');
  });

  it('becomes empty exactly when the difference reaches zero and stays empty afterwards', () => {
    const { container } = render(<EventCountdown eventDate={at(2000)} />);
    expect(container.textContent).toBe('0d 0h 0m 2s');
    act(() => void vi.advanceTimersByTime(1000));
    expect(container.textContent).toBe('0d 0h 0m 1s');
    act(() => void vi.advanceTimersByTime(1000));
    expect(container.textContent).toBe('');
    act(() => void vi.advanceTimersByTime(5000));
    expect(container.textContent).toBe('');
  });

  it('is empty for an event that is already in the past and for the exact present', () => {
    const past = render(<EventCountdown eventDate={at(-60_000)} />);
    expect(past.container.textContent).toBe('');
    const now = render(<EventCountdown eventDate={at(0)} />);
    expect(now.container.textContent).toBe('');
  });

  it('stays empty for an unparsable date', () => {
    const { container } = render(<EventCountdown eventDate="not-a-date" />);
    expect(container.textContent).toBe('');
  });

  it('follows a changed eventDate', () => {
    const { container, rerender } = render(<EventCountdown eventDate={at(10_000)} />);
    expect(container.textContent).toBe('0d 0h 0m 10s');
    rerender(<EventCountdown eventDate={at(3_600_000)} />);
    act(() => void vi.advanceTimersByTime(1000));
    expect(container.textContent).toBe('0d 0h 59m 59s');
  });

  it('clears its interval on unmount', () => {
    const { unmount } = render(<EventCountdown eventDate={at(60_000)} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.queryByText(/\d+d/)).not.toBeInTheDocument();
  });
});
