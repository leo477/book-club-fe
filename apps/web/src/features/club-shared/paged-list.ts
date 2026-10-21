import type { InfiniteData } from '@tanstack/react-query';

export const PAGE_SIZE = 100;

export interface Page<T> {
  items: T[];
  total: number | null;
}

export type PagedData<T> = InfiniteData<Page<T>, number>;

/** The offset of the next page, or undefined once every row is loaded; without a total a short page marks the end. */
export function nextSkip<T>(last: Page<T>, all: Page<T>[]): number | undefined {
  if (last.items.length === 0) return undefined;
  const loaded = all.reduce((sum, page) => sum + page.items.length, 0);
  if (last.total !== null) return loaded < last.total ? loaded : undefined;
  return last.items.length >= PAGE_SIZE ? loaded : undefined;
}

export function flatten<T>(data: PagedData<T>): { items: T[]; total: number | null } {
  const items = data.pages.flatMap((page) => page.items);
  const total = data.pages.at(-1)?.total ?? null;
  return { items, total: total === null ? null : Math.max(total, items.length) };
}

/** Applies a local edit to the loaded rows and keeps the total in step; the pages collapse into one, the next offset is the loaded count. */
export function editItems<T>(data: PagedData<T> | undefined, edit: (items: T[]) => T[]): PagedData<T> | undefined {
  if (!data) return data;
  const before = data.pages.flatMap((page) => page.items);
  const items = edit(before);
  const total = data.pages.at(-1)?.total ?? null;
  return { pages: [{ items, total: total === null ? null : Math.max(0, total + items.length - before.length) }], pageParams: [0] };
}
