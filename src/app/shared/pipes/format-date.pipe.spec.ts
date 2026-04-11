import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  let pipe: FormatDatePipe;

  beforeEach(() => {
    pipe = new FormatDatePipe();
  });

  it('should return em dash for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should return em dash for undefined', () => {
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should return em dash for empty string', () => {
    expect(pipe.transform('')).toBe('—');
  });

  it('should format valid ISO date', () => {
    const result = pipe.transform('2024-01-15T10:00:00Z');
    expect(result).not.toBe('—');
    expect(result).toContain('2024');
  });
});