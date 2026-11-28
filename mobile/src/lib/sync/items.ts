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

/** Four 32-bit hashes of a string (cyrb128), enough for a stable 128-bit id. */
function hash128(text: string): number[] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < text.length; i++) {
    const k = text.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1, h2, h3, h4].map((h) => h >>> 0);
}

/**
 * A UUID made from a piece of text, the same every time on every phone, for items whose id comes
 * from what they are (a plan for a day and slot, a toolkit card). Shaped as version 8, for ids
 * made this way. Only unique within one student; the server keys these by student and id.
 */
export function contentUuid(key: string): string {
  const hex = hash128(key)
    .map((h) => h.toString(16).padStart(8, '0'))
    .join('');
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `8${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}
