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

/** A joiner or leaver during a multi-page load can shift rows across a page boundary, so a row may arrive twice. */
export function flatten<T extends { userId: string }>(data: PagedData<T>): { items: T[]; total: number | null } {
  const seen = new Set<string>();
  const items = data.pages.flatMap((page) => page.items).filter((item) => !seen.has(item.userId) && seen.add(item.userId));
  return { items, total: data.pages.at(-1)?.total ?? null };
}

/** Applies a local edit to the loaded rows and keeps every page's size and the total in step, so a later refetch still asks for each page by its original skip. */
export function editItems<T>(data: PagedData<T> | undefined, edit: (items: T[]) => T[]): PagedData<T> | undefined {
  if (!data) return data;
  const before = data.pages.flatMap((page) => page.items);
  const items = edit(before);
  const delta = items.length - before.length;
  let start = 0;
  const pages = data.pages.map((page, index) => {
    const end = index === data.pages.length - 1 ? items.length : start + page.items.length;
    const chunk = items.slice(start, end);
    start = end;
    return { items: chunk, total: page.total === null ? null : Math.max(0, page.total + delta) };
  });
  return { pages, pageParams: data.pageParams };
}
