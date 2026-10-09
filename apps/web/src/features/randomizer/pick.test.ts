import { describe, expect, it } from 'vitest';
import { pickIndex } from './pick';

describe('pickIndex', () => {
  it('maps the draw onto the candidates by remainder', () => {
    expect(pickIndex(3, () => 7)).toBe(1);
    expect(pickIndex(5, () => 0)).toBe(0);
  });

  it('redraws values from the biased tail instead of folding them', () => {
    const draws = [0xffffffff, 4];
    let calls = 0;
    expect(pickIndex(3, () => draws[calls++] ?? 0)).toBe(1);
    expect(calls).toBe(2);
  });

  it('is uniform over many real draws', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 6000; i++) {
      const index = pickIndex(3);
      counts[index] = (counts[index] ?? 0) + 1;
    }
    expect(counts.every((n) => n > 1500)).toBe(true);
  });
});
