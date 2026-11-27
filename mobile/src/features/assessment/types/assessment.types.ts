import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerPhq9 = ResponseOf<'/v1/me/phq9', 'post'>;
export type SubmitPhq9 = BodyOf<'/v1/me/phq9', 'post'>;
export type ServerEpqr = ResponseOf<'/v1/me/epqr', 'post'>;
