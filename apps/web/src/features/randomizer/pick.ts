/** Uniform index below `count`: values from the biased tail of the 32-bit range are redrawn. */
export function pickIndex(count: number, random: () => number = () => crypto.getRandomValues(new Uint32Array(1))[0] ?? 0): number {
  const limit = Math.floor(0x100000000 / count) * count;
  let value = random();
  while (value >= limit) value = random();
  return value % count;
}
