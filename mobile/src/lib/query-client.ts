import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { type ApiError, isOffline, toApiError } from './api-error';

/** Queries retry once, and only when the phone couldn't reach the server. */
export function shouldRetryQuery(failureCount: number, error: unknown) {
  return failureCount < 1 && isOffline(toApiError(error));
}

let onAnyError: (error: ApiError) => void = () => undefined;

/**
 * Called for every failed query and mutation, for errors that mean the same thing on every
 * screen (consent missing, left the study). Wired up by the auth feature so this file never
 * imports a screen or the router.
 */
export function onApiError(handler: (error: ApiError) => void) {
  onAnyError = handler;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error) => onAnyError(toApiError(error)) }),
  mutationCache: new MutationCache({ onError: (error) => onAnyError(toApiError(error)) }),
  defaultOptions: {
    queries: { retry: shouldRetryQuery, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
