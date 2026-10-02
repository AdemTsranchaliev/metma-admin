const TTL_MS = 60_000;

type Entry = { data: unknown; at: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const epoch = new Map<string, number>();

function token(key: string) {
  return epoch.get(key) ?? 0;
}

/** Drop cached reads for one market site after a write. */
export function invalidateSite(site: string) {
  const needle = `:${site}`;
  const keys = new Set([...store.keys(), ...inflight.keys(), ...epoch.keys()]);
  for (const key of keys) {
    if (!key.includes(needle)) continue;
    store.delete(key);
    inflight.delete(key);
    epoch.set(key, token(key) + 1);
  }
}

/**
 * Browser-only read cache. Server renders always hit the source,
 * so one request cannot reuse another user's data.
 */
export function readCached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (typeof window === "undefined") return load();

  const hit = store.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return Promise.resolve(hit.data as T);
  }

  const pendingHit = inflight.get(key);
  if (pendingHit) return pendingHit as Promise<T>;

  const seen = token(key);
  const pending = load()
    .then((data) => {
      if (token(key) === seen) {
        store.set(key, { data, at: Date.now() });
      }
      return data;
    })
    .finally(() => {
      if (inflight.get(key) === pending) inflight.delete(key);
    });

  inflight.set(key, pending);
  return pending;
}
