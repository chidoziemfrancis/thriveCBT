import { type AxiosError, create, type InternalAxiosRequestConfig } from 'axios';
import * as Crypto from 'expo-crypto';

import { env } from '@/config/env';

import { toApiError } from './api-error';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set on login and refresh calls, so a 401 there never triggers another refresh. */
    skipAuthRefresh?: boolean;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { retried?: boolean };

/**
 * How the client reads and renews the login. Wired up by lib/session so this file never
 * imports the session store.
 */
export type AuthHooks = {
  getAccessToken: () => string | null;
  /** A new access token, or null when the login is no longer valid. Throws when offline. */
  refresh: () => Promise<string | null>;
  onSignedOut: () => void;
};

let auth: AuthHooks = {
  getAccessToken: () => null,
  refresh: async () => null,
  onSignedOut: () => undefined,
};

export function configureAuth(hooks: AuthHooks) {
  auth = hooks;
}

export const REQUEST_TIMEOUT_MS = 15_000;

export const api = create({
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

let refreshing: Promise<string | null> | null = null;

/** Requests that fail together share one refresh rather than starting one each. */
export function refreshOnce(): Promise<string | null> {
  refreshing ??= auth.refresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

api.interceptors.request.use((config) => {
  config.headers.set('x-request-id', Crypto.randomUUID());
  const token = auth.getAccessToken();
  if (token && !config.headers.has('Authorization'))
    config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && config && !config.retried && !config.skipAuthRefresh) {
      config.retried = true;
      let token: string | null;
      try {
        token = await refreshOnce();
      } catch (refreshError) {
        throw toApiError(refreshError);
      }
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
        return api(config);
      }
      auth.onSignedOut();
    }
    throw toApiError(error);
  }
);
