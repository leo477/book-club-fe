import { describe, expect, it } from 'vitest';
import { badgeLabel, buildItems, mergeIncoming, mergeLatest, prependOlder, senderLabel } from './chat-model';
import { msg } from './test-support';

const m = (id: string, senderId = 'u2', text = id) =>
  msg(id, text, { senderId, timestamp: new Date(2026, 0, 1, 10, 0, Number.parseInt(id, 10) || 0).toISOString() });
const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe('senderLabel', () => {
  it('keeps names and trims an email to its local part', () => {
    expect(senderLabel('Grace Hopper')).toBe('Grace Hopper');
    expect(senderLabel('grace@navy.mil')).toBe('grace');
    expect(senderLabel('@odd')).toBe('@odd');
  });
});

describe('mergeIncoming', () => {
  it('appends new messages and ignores an echo of one already held', () => {
    const a = mergeIncoming([m('1')], m('2'));
    expect(a.added).toBe(true);
    expect(ids(a.items)).toEqual(['1', '2']);
    const b = mergeIncoming(a.items, m('2'));
    expect(b.added).toBe(false);
    expect(ids(b.items)).toEqual(['1', '2']);
  });

  it('replaces the optimistic twin (same sender and text) instead of duplicating it', () => {
    const merged = mergeIncoming([m('1'), m('temp-9', 'u1', 'hello'), m('temp-10', 'u1', 'other')], m('7', 'u1', 'hello'));
    expect(ids(merged.items)).toEqual(['1', '7', 'temp-10']);
  });
});

describe('mergeLatest', () => {
  it('keeps older history already loaded and pending sends, takes the fresh page', () => {
    const prev = [m('1'), m('2'), m('3'), m('temp-1', 'u1', 'pending')];
    const merged = mergeLatest(prev, [m('3'), m('4')]);
    expect(ids(merged)).toEqual(['1', '2', '3', '4', 'temp-1']);
  });

  it('keeps a live arrival the fetch predates', () => {
    expect(ids(mergeLatest([m('1'), m('3'), m('9')], [m('3'), m('4')]))).toEqual(['1', '3', '4', '9']);
  });

  it('drops a pending send that the fresh page already contains', () => {
    expect(ids(mergeLatest([m('temp-1', 'u1', 'hi')], [m('5', 'u1', 'hi')]))).toEqual(['5']);
  });

  it('takes the fresh page whole when nothing overlaps', () => {
    expect(ids(mergeLatest([m('1')], [m('8'), m('9')]))).toEqual(['8', '9']);
  });
});

describe('prependOlder', () => {
  it('puts older messages first without duplicates', () => {
    expect(ids(prependOlder([m('3'), m('4')], [m('2'), m('3')]))).toEqual(['2', '3', '4']);
  });
});

describe('buildItems', () => {
  const list = [m('1', 'a'), m('2', 'a'), m('3', 'b'), m('4', 'a')];

  it('groups consecutive messages of one sender and flags own ones', () => {
    const items = buildItems(list, null, 'a');
    expect(items.map((i) => (i.kind === 'message' ? [i.id, i.isGroupFirst, i.isGroupLast, i.isOwn] : 'divider'))).toEqual([
      ['1', true, false, true],
      ['2', false, true, true],
      ['3', true, true, false],
      ['4', true, true, true],
    ]);
  });

  it('inserts the unread divider after the last read message and restarts the group there', () => {
    const items = buildItems(list, '1', 'z');
    expect(items.map((i) => i.id)).toEqual(['1', 'unread-divider', '2', '3', '4']);
    const second = items[2];
    expect(second?.kind === 'message' && second.isGroupFirst).toBe(true);
    const first = items[0];
    expect(first?.kind === 'message' && first.isGroupLast).toBe(true);
  });

  it('shows no divider when everything is read, or the marker is unknown', () => {
    expect(buildItems(list, '4', 'z').some((i) => i.kind === 'divider')).toBe(false);
    expect(buildItems(list, 'gone', 'z').some((i) => i.kind === 'divider')).toBe(false);
    expect(buildItems([], '1', 'z')).toEqual([]);
  });
});

describe('badgeLabel', () => {
  it('caps at 9+', () => {
    expect([1, 9, 10, 250].map(badgeLabel)).toEqual(['1', '9', '9+', '9+']);
  });
});
