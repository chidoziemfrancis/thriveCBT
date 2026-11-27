import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { kvStorage } from '@/lib/zustand-storage';
import type { ResponseOf } from '@/types/api-helpers';

export type SessionUser = ResponseOf<'/v1/me', 'get'>;

type SessionState = {
  status: 'loading' | 'signedOut' | 'signedIn';
  /** Only in memory: a fresh one comes from the refresh token each time the app starts. */
  accessToken: string | null;
  user: SessionUser | null;
  signIn: (accessToken: string | null, user: SessionUser) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: SessionUser) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      status: 'loading',
      accessToken: null,
      user: null,
      signIn: (accessToken, user) => set({ status: 'signedIn', accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      signOut: () => set({ status: 'signedOut', accessToken: null, user: null }),
    }),
    {
      name: 'session',
      storage: kvStorage,
      // The user is kept so the app opens offline; the token never touches storage.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
