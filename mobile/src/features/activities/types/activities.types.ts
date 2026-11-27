import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerPlannedActivity = ResponseOf<'/v1/me/planned-activities/{id}', 'put'>;
export type SavePlannedActivityBody = BodyOf<'/v1/me/planned-activities/{id}', 'put'>;
