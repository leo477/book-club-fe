import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { NAMESPACES } from './events-intl';

vi.mock('next-intl/server', () => ({ getLocale: vi.fn(), getMessages: vi.fn() }));

describe('EventsIntl namespaces', () => {
  it('provides every namespace a component of the events feature asks for', () => {
    const used = readdirSync(__dirname)
      .filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f))
      .flatMap((f) => [...readFileSync(join(__dirname, f), 'utf8').matchAll(/useTranslations\(\s*'([^']+)'/g)].map((m) => [f, m[1]!.split('.')[0]!] as const));
    expect(used.length).toBeGreaterThan(0);
    const missing = used.filter(([, ns]) => !(NAMESPACES as readonly string[]).includes(ns)).map(([f, ns]) => `${f}: ${ns}`);
    expect(missing).toEqual([]);
  });
});
