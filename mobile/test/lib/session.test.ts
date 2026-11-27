import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockKeychain = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: async (key: string) => mockKeychain.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => {
    mockKeychain.set(key, value);
  },
  deleteItemAsync: async (key: string) => {
    mockKeychain.delete(key);
  },
}));
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: () => null,
    setItemSync: () => undefined,
    removeItemSync: () => undefined,
  },
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'id' }));

const mockPost = jest.fn<(...args: unknown[]) => Promise<{ data: unknown }>>();
const mockGet = jest.fn<(...args: unknown[]) => Promise<{ data: unknown }>>();
jest.mock('@/lib/axios', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
  configureAuth: () => undefined,
}));

import { ApiError } from '@/lib/api-error';
import { endSession, refreshTokens, restoreSession, startSession } from '@/lib/session';
import { useSessionStore } from '@/stores/session.store';

const user = {
  id: 'u1',
  email: 'ada@uni.edu',
  role: 'student',
  status: 'active',
  emailVerified: true,
  createdAt: 'x',
};

beforeEach(() => {
  mockKeychain.clear();
  mockPost.mockReset();
  mockGet.mockReset();
  useSessionStore.setState({ status: 'loading', accessToken: null, user: null });
});

describe('session', () => {
  it('starts a session: refresh token to secure storage, access token to memory', async () => {
    await startSession({ accessToken: 'a1', refreshToken: 'r1', user: user as never });
    expect(mockKeychain.get('refresh_token')).toBe('r1');
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedIn',
      accessToken: 'a1',
      user,
    });
  });

  it('ends a session: clears the token and the user, then tells the server', async () => {
    mockPost.mockResolvedValue({ data: undefined });
    await startSession({ accessToken: 'a1', refreshToken: 'r1', user: user as never });
    await endSession();
    expect(mockKeychain.has('refresh_token')).toBe(false);
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      accessToken: null,
      user: null,
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/logout',
      { refreshToken: 'r1' },
      { skipAuthRefresh: true }
    );
  });

  it('refreshes with the stored token and keeps the new one', async () => {
    mockKeychain.set('refresh_token', 'r1');
    mockPost.mockResolvedValue({ data: { accessToken: 'a2', refreshToken: 'r2' } });
    await expect(refreshTokens()).resolves.toBe('a2');
    expect(mockKeychain.get('refresh_token')).toBe('r2');
  });

  it('says the login has ended when there is no token or the server refuses it', async () => {
    await expect(refreshTokens()).resolves.toBeNull();
    mockKeychain.set('refresh_token', 'r1');
    mockPost.mockRejectedValue(new ApiError('AUTH_TOKEN_REUSED', 'No', 401));
    await expect(refreshTokens()).resolves.toBeNull();
  });

  it('keeps the last user signed in when the app opens offline', async () => {
    mockKeychain.set('refresh_token', 'r1');
    useSessionStore.setState({ user: user as never });
    mockPost.mockRejectedValue(new ApiError('NETWORK_ERROR', 'Offline'));
    await restoreSession();
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedIn',
      accessToken: null,
      user,
    });
  });

  it('signs out on open when the login can no longer be renewed', async () => {
    useSessionStore.setState({ user: user as never });
    await restoreSession();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });
});
