/** In-memory cache whose entries expire after a fixed TTL (port of core/utils/ttl-cache.util.ts). */
export class TtlCache<T> {
  private readonly entries = new Map<string, { data: T; fetchedAt: number }>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > this.ttlMs) {
      this.entries.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    this.entries.set(key, { data, fetchedAt: Date.now() });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }
}
