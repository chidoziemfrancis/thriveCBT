/** Helpers for kinds that sync as a list of items with phone-made ids. */

type LocalItem = { id: string; updatedAt?: string };
type ServerItem = { id: string; updatedAt: string; deletedAt: string | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (id: string) => UUID.test(id);

/**
 * Items saved before sync had ids like `thought-1730000000000`, which the server can't take;
 * those get a fresh UUID. Returns null when nothing needed changing.
 */
export function withUuids<T extends { id: string }>(items: T[], makeId: () => string): T[] | null {
  if (items.every((item) => isUuid(item.id))) return null;
  return items.map((item) => (isUuid(item.id) ? item : { ...item, id: makeId() }));
}

/**
 * The phone's list after a pull: items deleted elsewhere are removed, and the server's copy is
 * taken wherever it's at least as new as the phone's. The order of the phone's list is kept;
 * new items go at the end.
 */
export function mergeServerItems<L extends LocalItem, S extends ServerItem>(
  local: L[],
  items: S[],
  toLocal: (item: S) => L
): L[] {
  const byId = new Map(local.map((item) => [item.id, item]));
  for (const item of items) {
    if (item.deletedAt) {
      byId.delete(item.id);
      continue;
    }
    const mine = byId.get(item.id);
    if (mine?.updatedAt && mine.updatedAt > item.updatedAt) continue;
    byId.set(item.id, toLocal(item));
  }
  return [...byId.values()];
}

/** The phone's items the server doesn't have yet. */
export function notOnServer<L extends { id: string }>(local: L[], serverItems: { id: string }[]) {
  const onServer = new Set(serverItems.map((item) => item.id));
  return local.filter((item) => !onServer.has(item.id));
}
