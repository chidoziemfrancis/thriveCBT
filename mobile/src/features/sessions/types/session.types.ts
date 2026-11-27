import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerSession = ResponseOf<'/v1/me/sessions/{sessionId}', 'put'>;
export type SaveSessionBody = BodyOf<'/v1/me/sessions/{sessionId}', 'put'>;
