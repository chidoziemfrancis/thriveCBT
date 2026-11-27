import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerPositiveEntry = ResponseOf<'/v1/me/positive-entries/{id}', 'put'>;
export type SavePositiveEntryBody = BodyOf<'/v1/me/positive-entries/{id}', 'put'>;
