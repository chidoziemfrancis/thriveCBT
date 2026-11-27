import Storage from 'expo-sqlite/kv-store';
import { createJSONStorage } from 'zustand/middleware';

/** Lets Zustand stores persist to the same kv-store as the rest of the app. Never for secrets. */
export const kvStorage = createJSONStorage(() => ({
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => Storage.removeItemSync(key),
}));
