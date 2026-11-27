import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerThoughtRecord = ResponseOf<'/v1/me/thought-records/{id}', 'put'>;
export type SaveThoughtRecordBody = BodyOf<'/v1/me/thought-records/{id}', 'put'>;
