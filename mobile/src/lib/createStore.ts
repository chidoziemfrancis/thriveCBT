import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from './storage';

/** A value kept in storage that screens can subscribe to. */
export function createStore<T>(key: string, fallback: T) {
  let value = readJson<T>(key, fallback);
  const listeners = new Set<() => void>();

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    get: () => value,
    set(next: T) {
      value = next;
      writeJson(key, value);
      listeners.forEach((listener) => listener());
    },
    use: () => useSyncExternalStore(subscribe, () => value),
  };
}
