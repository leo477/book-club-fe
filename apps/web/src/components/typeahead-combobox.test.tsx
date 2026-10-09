import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TypeaheadCombobox } from './typeahead-combobox';

interface Item {
  id: string;
  label: string;
}

const items: Item[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

interface HarnessProps {
  search?: (query: string, signal: AbortSignal) => Promise<Item[]>;
  minLength?: number;
  shortQuery?: 'clear' | 'ignore';
  dedupe?: boolean;
  ttlMs?: number;
  onSelect?: (item: Item) => void;
  onFailedChange?: (failed: boolean) => void;
  onSubmit?: () => void;
}

function Harness({ search, minLength = 2, shortQuery = 'clear', dedupe = false, ttlMs, onSelect, onFailedChange, onSubmit }: HarnessProps) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <TypeaheadCombobox<Item>
        value={value}
        onValueChange={setValue}
        onSelect={(item) => {
          setValue(item.label);
          onSelect?.(item);
        }}
        search={search ?? (() => Promise.resolve(items))}
        getKey={(i) => i.id}
        renderItem={(i) => i.label}
        debounceMs={300}
        minLength={minLength}
        shortQuery={shortQuery}
        dedupe={dedupe}
        label="Place"
        {...(ttlMs === undefined ? {} : { ttlMs })}
        {...(onFailedChange ? { onFailedChange } : {})}
        errorMessage={null}
      />
    </form>
  );
}

const setup = () => userEvent.setup({ delay: null });
const settle = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

describe('TypeaheadCombobox', () => {
  // testing-library only advances fake timers while waiting when it finds a `jest` global
  beforeEach(() => {
    vi.stubGlobal('jest', { advanceTimersByTime: vi.advanceTimersByTime });
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('exposes the ARIA 1.2 combobox contract and follows the popup state in aria-expanded', async () => {
    const user = setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Place' });
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await user.type(input, 'Al');
    await settle(300);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox');
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[0]?.id);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1]?.id);
  });

  it('waits for the debounce, then searches once with the final text', async () => {
    const search = vi.fn(() => Promise.resolve(items));
    const user = setup();
    render(<Harness search={search} />);
    await user.type(screen.getByRole('combobox'), 'Alp');
    await settle(299);
    expect(search).not.toHaveBeenCalled();
    await settle(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('Alp', expect.any(AbortSignal));
  });

  it('does not search below the minimum length and closes an open list when the query shrinks (clear)', async () => {
    const search = vi.fn(() => Promise.resolve(items));
    const user = setup();
    render(<Harness search={search} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'A');
    await settle(300);
    expect(search).not.toHaveBeenCalled();
    await user.type(input, 'l');
    await settle(300);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.clear(input);
    await settle(300);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('keeps the list when a short query is ignored', async () => {
    const user = setup();
    render(<Harness minLength={3} shortQuery="ignore" />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Alp');
    await settle(300);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.type(input, '{Backspace}');
    await settle(300);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('serves a repeated query from the TTL cache and searches again once it expired', async () => {
    const search = vi.fn(() => Promise.resolve(items));
    const user = setup();
    render(<Harness search={search} ttlMs={1000} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await settle(300);
    expect(search).toHaveBeenCalledTimes(1);
    await user.clear(input);
    await settle(300);
    await user.type(input, 'Al');
    await settle(300);
    expect(search).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.clear(input);
    await settle(1500);
    await user.type(input, 'Al');
    await settle(300);
    expect(search).toHaveBeenCalledTimes(2);
  });

  it('skips a query equal to the previous one when dedupe is on', async () => {
    const search = vi.fn(() => Promise.resolve(items));
    const user = setup();
    render(<Harness search={search} dedupe ttlMs={1} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await settle(300);
    await user.type(input, 'x{Backspace}');
    await settle(300);
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('aborts the superseded request and shows only the latest answer', async () => {
    const pending: { query: string; signal: AbortSignal; resolve: (v: Item[]) => void }[] = [];
    const search = vi.fn(
      (query: string, signal: AbortSignal) =>
        new Promise<Item[]>((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
          pending.push({ query, signal, resolve });
        }),
    );
    const user = setup();
    render(<Harness search={search} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await settle(300);
    await user.type(input, 'p');
    await settle(300);
    expect(pending).toHaveLength(2);
    expect(pending[0]?.signal.aborted).toBe(true);
    await act(async () => {
      pending[0]?.resolve([{ id: 'old', label: 'Stale' }]);
      pending[1]?.resolve([{ id: 'new', label: 'Fresh' }]);
    });
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Fresh']);
  });

  it('reports a failed search, closes the list and clears the failure on the next search', async () => {
    const onFailedChange = vi.fn();
    const search = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue(items);
    const user = setup();
    render(<Harness search={search} onFailedChange={onFailedChange} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await settle(300);
    expect(onFailedChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.type(input, 'p');
    await settle(300);
    expect(onFailedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('moves with the arrow keys (wrapping), picks with Enter, closes and does not search for the picked text', async () => {
    const search = vi.fn(() => Promise.resolve(items));
    const onSelect = vi.fn();
    const user = setup();
    render(<Harness search={search} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await settle(300);
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Gamma');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Beta');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(items[1]);
    expect(input).toHaveValue('Beta');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await settle(1000);
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('picks with the pointer', async () => {
    const onSelect = vi.fn();
    const user = setup();
    render(<Harness onSelect={onSelect} />);
    await user.type(screen.getByRole('combobox'), 'Al');
    await settle(300);
    await user.click(screen.getByRole('option', { name: 'Gamma' }));
    expect(onSelect).toHaveBeenCalledWith(items[2]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape and reopens on focus while it still has results', async () => {
    const user = setup();
    render(<Harness />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await settle(300);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.tab();
    await user.tab({ shift: true });
    expect(input).toHaveFocus();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('keeps focus in the input while the list is open', async () => {
    const user = setup();
    render(<Harness />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    await settle(300);
    expect(input).toHaveFocus();
  });

  it('submits the surrounding form on Enter while closed, and does not while a list is open', async () => {
    const onSubmit = vi.fn();
    const user = setup();
    render(<Harness onSubmit={onSubmit} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'A{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await user.type(input, 'l');
    await settle(300);
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('stops everything when unmounted mid-debounce', async () => {
    const search = vi.fn(() => Promise.resolve(items));
    const user = setup();
    const { unmount } = render(<Harness search={search} />);
    await user.type(screen.getByRole('combobox'), 'Al');
    unmount();
    await settle(1000);
    expect(search).not.toHaveBeenCalled();
  });
});
