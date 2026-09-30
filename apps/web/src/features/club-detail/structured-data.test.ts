import { describe, expect, it } from 'vitest';
import { safeHttpUrl } from './structured-data';

describe('safeHttpUrl', () => {
  it('keeps absolute http(s) URLs and drops everything else', () => {
    expect(safeHttpUrl('https://img.example/c.jpg')).toBe('https://img.example/c.jpg');
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeHttpUrl('data:text/html,x')).toBeUndefined();
    expect(safeHttpUrl('/relative.png')).toBeUndefined();
    expect(safeHttpUrl(null)).toBeUndefined();
  });
});
