import Storage from 'expo-sqlite/kv-store';

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = Storage.getItemSync(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  Storage.setItemSync(key, JSON.stringify(value));
}

export function removeKey(key: string) {
  Storage.removeItemSync(key);
}

export function clearAll() {
  Storage.clearSync();
}
