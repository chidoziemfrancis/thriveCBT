import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerJournalEntry = ResponseOf<'/v1/me/journal/{id}', 'put'>;
export type SaveJournalBody = BodyOf<'/v1/me/journal/{id}', 'put'>;
