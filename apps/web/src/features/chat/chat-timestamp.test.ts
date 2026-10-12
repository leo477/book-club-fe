import { describe, expect, it } from 'vitest';
import { formatChatTimestamp } from './chat-timestamp';

const words = { today: 'today', yesterday: 'yesterday' };
const NOW = new Date(2026, 5, 15, 12, 0, 0);
const at = (day: number, h: number, min: number, month = 5) => new Date(2026, month, day, h, min);

describe('formatChatTimestamp', () => {
  it('prefixes today and yesterday with a word and a 24h time', () => {
    expect(formatChatTimestamp(at(15, 9, 5), 'en', words, NOW)).toBe('today 09:05');
    expect(formatChatTimestamp(at(14, 23, 59), 'en', words, NOW)).toBe('yesterday 23:59');
  });

  it('yesterday works across a month boundary', () => {
    expect(formatChatTimestamp(at(30, 8, 0, 4), 'en', words, new Date(2026, 5, 1, 12))).not.toBe('');
    expect(formatChatTimestamp(at(31, 8, 0, 4), 'en', words, new Date(2026, 5, 1, 12))).toBe('yesterday 08:00');
  });

  it('older messages get a short localized date', () => {
    expect(formatChatTimestamp(at(3, 7, 30), 'en', words, NOW)).toBe('Jun 3 07:30');
    expect(formatChatTimestamp(at(3, 7, 30), 'uk', words, NOW)).toMatch(/^3 черв\.? 07:30$/);
    expect(formatChatTimestamp(at(3, 7, 30), 'xx', words, NOW)).toBe('Jun 3 07:30');
  });

  it('accepts ISO strings and returns empty for missing or invalid input', () => {
    expect(formatChatTimestamp(at(15, 10, 0).toISOString(), 'en', words, NOW)).toBe('today 10:00');
    expect(formatChatTimestamp(null, 'en', words, NOW)).toBe('');
    expect(formatChatTimestamp('nope', 'en', words, NOW)).toBe('');
  });
});
