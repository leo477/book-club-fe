import { InitialsPipe } from './initials.pipe';

describe('InitialsPipe', () => {
  let pipe: InitialsPipe;

  beforeEach(() => {
    pipe = new InitialsPipe();
  });

  it('returns ? for null', () => {
    expect(pipe.transform(null)).toBe('?');
  });

  it('returns ? for undefined', () => {
    expect(pipe.transform(undefined)).toBe('?');
  });

  it('returns ? for empty string', () => {
    expect(pipe.transform('')).toBe('?');
  });

  it('returns first two chars for single name', () => {
    expect(pipe.transform('Alice')).toBe('AL');
  });

  it('returns two initials for full name', () => {
    expect(pipe.transform('Alice Smith')).toBe('AS');
  });

  it('returns first two word initials for three names', () => {
    expect(pipe.transform('Alice Mary Smith')).toBe('AM');
  });

  it('uppercases initials', () => {
    expect(pipe.transform('a b')).toBe('AB');
  });

  it('handles single character name', () => {
    expect(pipe.transform('Z')).toBe('Z');
  });
});