import { describe, expect, it } from 'vitest';
import { PAGE_SIZE, editItems, flatten, nextSkip, type Page, type PagedData } from './paged-list';

const page = (count: number, total: number | null, from = 0): Page<number> => ({ items: Array.from({ length: count }, (_, i) => from + i), total });

describe('nextSkip', () => {
  it('continues from the loaded count while the total is not reached', () => {
    const first = page(PAGE_SIZE, 230);
    expect(nextSkip(first, [first])).toBe(PAGE_SIZE);
  });

  it('stops once the total is reached or a page is empty', () => {
    const first = page(PAGE_SIZE, 230);
    const second = page(PAGE_SIZE, 230, 100);
    const last = page(30, 230, 200);
    expect(nextSkip(last, [first, second, last])).toBeUndefined();
    expect(nextSkip(page(0, 230), [first])).toBeUndefined();
  });

  it('without a total, a full page means more and a short page means done', () => {
    expect(nextSkip(page(PAGE_SIZE, null), [page(PAGE_SIZE, null)])).toBe(PAGE_SIZE);
    expect(nextSkip(page(3, null), [page(3, null)])).toBeUndefined();
  });
});

describe('flatten and editItems', () => {
  const data: PagedData<number> = { pages: [page(2, 5), page(2, 5, 2)], pageParams: [0, 2] };

  it('joins the pages and takes the total of the last one', () => {
    expect(flatten(data)).toEqual({ items: [0, 1, 2, 3], total: 5 });
  });

  it('applies an edit to the loaded rows and moves the total with them', () => {
    const edited = editItems(data, (items) => items.filter((n) => n !== 1));
    expect(flatten(edited!)).toEqual({ items: [0, 2, 3], total: 4 });
    expect(editItems(undefined, (items) => items)).toBeUndefined();
  });
});
