'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { inputClassName } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { TtlCache } from '@/lib/ttl-cache';
import { cn } from '@/lib/utils';

const DEFAULT_TTL_MS = 5 * 60_000;

type InputProps = Omit<ComponentProps<typeof CommandInput>, 'value' | 'onValueChange' | 'className'> & { 'data-testid'?: string };

export interface TypeaheadProps<T> {
  /** The text in the input; the owner sets it again on select. */
  value: string;
  /** Called for every keystroke only, never for the value the owner writes on select, so a pick cannot start a new search. */
  onValueChange: (value: string) => void;
  onSelect: (item: T) => void;
  search: (query: string, signal: AbortSignal) => Promise<T[]>;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  debounceMs: number;
  minLength: number;
  /** A query below minLength either empties the list ('clear') or is dropped without touching it ('ignore'). */
  shortQuery: 'clear' | 'ignore';
  /** Skip a search whose query equals the previous one that reached the debounce gate. */
  dedupe?: boolean;
  ttlMs?: number;
  /** Accessible name of the combobox and its list. */
  label: string;
  /** Owner-side work in flight (e.g. resolving a place) shown with the same spinner. */
  busy?: boolean;
  errorMessage?: string | null | undefined;
  /** Reports a failed search so the owner can show its message. */
  onFailedChange?: (failed: boolean) => void;
  invalid?: boolean;
  inputProps?: InputProps;
}

/**
 * ARIA 1.2 editable combobox with list autocomplete: shadcn Command (cmdk) in a Radix Popover anchored to the input.
 * Server-side search with debounce, minimum length, switch-to-latest (stale responses are aborted) and a TTL cache.
 */
export function TypeaheadCombobox<T>({
  value,
  onValueChange,
  onSelect,
  search,
  getKey,
  renderItem,
  debounceMs,
  minLength,
  shortQuery,
  dedupe = false,
  ttlMs = DEFAULT_TTL_MS,
  label,
  busy = false,
  errorMessage,
  onFailedChange,
  invalid = false,
  inputProps,
}: TypeaheadProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<HTMLElement | null>(null);
  const [cache] = useState(() => new TtlCache<T[]>(ttlMs));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const controller = useRef<AbortController | null>(null);
  const lastQuery = useRef<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef({ search, onFailedChange });

  useLayoutEffect(() => {
    latest.current = { search, onFailedChange };
  });

  const expanded = open && items.length > 0;
  // cmdk hard-codes aria-expanded="true" on its input and reads aria-activedescendant before the first option is marked selected;
  // ARIA 1.2 wants the first to follow the popup and the second to name the highlighted option
  useLayoutEffect(() => {
    input.current?.setAttribute('aria-expanded', String(expanded));
  }, [expanded]);

  useEffect(() => {
    const el = input.current;
    if (!el || !list) return;
    const sync = () => {
      const id = list.querySelector('[cmdk-item][aria-selected="true"]')?.id;
      if (id) el.setAttribute('aria-activedescendant', id);
      else el.removeAttribute('aria-activedescendant');
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-selected'] });
    return () => {
      observer.disconnect();
      el.removeAttribute('aria-activedescendant');
    };
  }, [list]);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      controller.current?.abort();
    },
    [],
  );

  const show = (results: T[]) => {
    setLoading(false);
    setItems(results);
    setOpen(results.length > 0);
  };

  const run = async (query: string) => {
    if (dedupe && lastQuery.current === query) return;
    lastQuery.current = query;
    if (query.length < minLength) {
      controller.current?.abort();
      if (shortQuery === 'clear') {
        latest.current.onFailedChange?.(false);
        show([]);
      } else {
        setLoading(false);
      }
      return;
    }
    latest.current.onFailedChange?.(false);
    const cached = cache.get(query);
    if (cached) {
      controller.current?.abort();
      show(cached);
      return;
    }
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    try {
      const results = await latest.current.search(query, current.signal);
      if (current.signal.aborted) return;
      cache.set(query, results);
      show(results);
    } catch {
      if (current.signal.aborted) return;
      // the same text must be searchable again after a failure
      lastQuery.current = null;
      latest.current.onFailedChange?.(true);
      show([]);
    }
  };

  const type = (next: string) => {
    onValueChange(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void run(next), debounceMs);
  };

  const pick = (item: T) => {
    clearTimeout(timer.current);
    controller.current?.abort();
    lastQuery.current = null;
    setLoading(false);
    setItems([]);
    setOpen(false);
    onSelect(item);
  };

  // cmdk swallows Enter even with nothing to pick; a closed combobox must still submit its form like a plain input
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' || expanded || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const form = input.current?.form;
    // requestSubmit bypasses a disabled submit button, so honour it here
    const blocked = form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled ?? false;
    if (!blocked) form?.requestSubmit();
  };

  return (
    <div className="relative">
      <Popover open={expanded} onOpenChange={setOpen}>
        <Command shouldFilter={false} loop label={label} onKeyDown={onKeyDown} className="overflow-visible bg-transparent">
          <PopoverAnchor asChild>
            <div className="relative">
              <CommandInput
                ref={input}
                value={value}
                onValueChange={type}
                autoComplete="off"
                aria-invalid={invalid || undefined}
                onFocus={() => items.length > 0 && setOpen(true)}
                className={cn(inputClassName, 'pr-8')}
                {...inputProps}
              />
              {(loading || busy) && <Spinner className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm" />}
            </div>
          </PopoverAnchor>
          <PopoverContent
            align="start"
            role="presentation"
            className="w-(--radix-popover-trigger-width) min-w-48 overflow-hidden p-0"
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (event.target instanceof Element && event.target.closest('[data-slot="popover-anchor"]')) event.preventDefault();
            }}
            // keep the caret in the input while the pointer picks an option
            onMouseDown={(event) => event.preventDefault()}
          >
            <CommandList label={label} ref={setList}>
              {items.map((item, index) => (
                <CommandItem key={`${index}:${getKey(item)}`} value={`${index}:${getKey(item)}`} onSelect={() => pick(item)}>
                  {renderItem(item)}
                </CommandItem>
              ))}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
      {errorMessage ? (
        <p role="alert" className="mt-1 text-xs text-red-500">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
