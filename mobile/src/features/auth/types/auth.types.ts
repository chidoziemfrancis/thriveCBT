import type { SessionUser } from '@/stores/session.store';
import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type { SessionUser };
export type Role = SessionUser['role'];
export type Credentials = BodyOf<'/v1/auth/login', 'post'>;
export type SessionResponse = ResponseOf<'/v1/auth/login', 'post'>;
export type CheckEmailResult = ResponseOf<'/v1/auth/check-email', 'post'>;
export type ResetConfirmBody = BodyOf<'/v1/auth/password-reset/confirm', 'post'>;
