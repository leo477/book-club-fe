import { describe, expect, it } from 'vitest';
import { isUuid } from './uuid';

describe('isUuid', () => {
  it.each(['3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f', '3F2B8C1E-9A4D-4E7B-8C5F-1A2B3C4D5E6F'])('accepts %s', (v) => expect(isUuid(v)).toBe(true));
  it.each(['', 'create', '123', '../x', '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f/x', '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6'])('rejects %j', (v) => expect(isUuid(v)).toBe(false));
});
