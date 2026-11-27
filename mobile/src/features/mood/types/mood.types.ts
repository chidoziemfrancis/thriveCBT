import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerMood = ResponseOf<'/v1/me/moods/{id}', 'put'>;
export type SaveMoodBody = BodyOf<'/v1/me/moods/{id}', 'put'>;
