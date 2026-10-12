// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const script = fileURLToPath(new URL('../../scripts/check-legacy-guard.mjs', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'legacy-guard-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const server = (name: string, source: string) => {
  const root = join(dir, name);
  mkdirSync(join(root, 'chunks'), { recursive: true });
  writeFileSync(join(root, 'chunks', 'a.js'), source);
  return root;
};
const run = (expectation: string, root: string) => spawnSync(process.execPath, [script, expectation, root], { encoding: 'utf8' }).status;

describe('check-legacy-guard', () => {
  const baked = server('baked', 'console.error("LEGACY_FALLBACK_DISABLED_AT_BUILD: this deployment was built with x")');
  const clean = server('clean', 'console.log("hi")');

  it('passes when the guard matches the expectation', () => {
    expect(run('present', baked)).toBe(0);
    expect(run('absent', clean)).toBe(0);
  });

  it('fails when it does not', () => {
    expect(run('absent', baked)).toBe(1);
    expect(run('present', clean)).toBe(1);
  });
});
