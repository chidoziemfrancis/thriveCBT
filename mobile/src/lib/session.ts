import { useSessionStore, type SessionUser } from '@/stores/session.store';
import type { ResponseOf } from '@/types/api-helpers';

import { isOffline, toApiError } from './api-error';
import { api, configureAuth } from './axios';
import { queryClient } from './query-client';
import { refreshTokenStore } from './secure-storage';

type TokenPair = ResponseOf<'/v1/auth/refresh', 'post'>;
export type Session = TokenPair & { user: SessionUser };

/** Swaps the stored refresh token for a new pair. Null means the login has ended; throws offline. */
export async function refreshTokens(): Promise<string | null> {
  const refreshToken = await refreshTokenStore.get();
  if (!refreshToken) return null;
  try {
    const { data } = await api.post<TokenPair>(
      '/auth/refresh',
      { refreshToken },
      { skipAuthRefresh: true }
    );
    await refreshTokenStore.set(data.refreshToken);
    useSessionStore.getState().setAccessToken(data.accessToken);
    return data.accessToken;
  } catch (error) {
    const apiError = toApiError(error);
    if (isOffline(apiError)) throw apiError;
    return null;
  }
}

export async function startSession({ accessToken, refreshToken, user }: Session) {
  await refreshTokenStore.set(refreshToken);
  useSessionStore.getState().signIn(accessToken, user);
}

/** Clears everything the next person on this phone shouldn't see, then tells the server. */
export async function endSession() {
  const refreshToken = await refreshTokenStore.get();
  await refreshTokenStore.clear();
  queryClient.clear();
  useSessionStore.getState().signOut();
  if (refreshToken) {
    api.post('/auth/logout', { refreshToken }, { skipAuthRefresh: true }).catch(() => undefined);
  }
}

/** On app start: renew the login if there is one. Offline, the last known user is kept. */
export async function restoreSession() {
  const { user, signIn, signOut } = useSessionStore.getState();
  try {
    const accessToken = await refreshTokens();
    if (!accessToken) {
      await refreshTokenStore.clear();
      signOut();
      return;
    }
    const { data } = await api.get<SessionUser>('/me');
    signIn(accessToken, data);
  } catch {
    if (user && (await refreshTokenStore.get())) signIn(null, user);
    else signOut();
  }
}

configureAuth({
  getAccessToken: () => useSessionStore.getState().accessToken,
  refresh: refreshTokens,
  onSignedOut: () => {
    void endSession();
  },
});
