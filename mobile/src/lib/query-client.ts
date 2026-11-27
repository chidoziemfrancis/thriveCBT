import { QueryClient } from '@tanstack/react-query';

import { isOffline, toApiError } from './api-error';

/** Queries retry once, and only when the phone couldn't reach the server. */
export function shouldRetryQuery(failureCount: number, error: unknown) {
  return failureCount < 1 && isOffline(toApiError(error));
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetryQuery, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
