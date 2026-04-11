import { InitialsPipe } from './initials.pipe';
import { provideZonelessChangeDetection } from '@angular/core';

describe('InitialsPipe', () => {
  let pipe: InitialsPipe;

  beforeEach(() => {
    pipe = new InitialsPipe();
  });

  it('should return first initial for single name', () => {
    expect(pipe.transform('Alice')).toBe('A');
  });

  it('should return two initials for two names', () => {
    expect(pipe.transform('Alice Smith')).toBe('AS');
  });

  it('should return first two initials for three names', () => {
    expect(pipe.transform('Alice Mary Smith')).toBe('AM');
  });

  it('should uppercase initials', () => {
    expect(pipe.transform('a b')).toBe('AB');
  });

  it('should handle single character', () => {
    expect(pipe.transform('Z')).toBe('Z');
  });
});