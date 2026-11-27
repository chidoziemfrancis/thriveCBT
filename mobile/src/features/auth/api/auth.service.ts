import { api } from '@/lib/axios';

import type {
  CheckEmailResult,
  Credentials,
  ResetConfirmBody,
  SessionResponse,
  SessionUser,
} from '../types/auth.types';

const open = { skipAuthRefresh: true };

export const authService = {
  checkEmail: (email: string) =>
    api.post<CheckEmailResult>('/auth/check-email', { email }, open).then((r) => r.data),
  register: (body: Credentials) =>
    api.post<SessionResponse>('/auth/register', body, open).then((r) => r.data),
  login: (body: Credentials) =>
    api.post<SessionResponse>('/auth/login', body, open).then((r) => r.data),
  verifyEmail: (code: string) =>
    api.post<SessionUser>('/auth/verify-email', { code }).then((r) => r.data),
  resendCode: () => api.post('/auth/verify-email/resend').then(() => undefined),
  requestReset: (email: string) =>
    api.post('/auth/password-reset/request', { email }, open).then(() => undefined),
  confirmReset: (body: ResetConfirmBody) =>
    api.post('/auth/password-reset/confirm', body, open).then(() => undefined),
};
