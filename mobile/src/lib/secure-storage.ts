import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refresh_token';

/** The refresh token lives only here: never in kv-store, Zustand persist or logs. */
export const refreshTokenStore = {
  get: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
};
