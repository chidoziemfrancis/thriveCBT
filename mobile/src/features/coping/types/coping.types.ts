import type { BodyOf, ResponseOf } from '@/types/api-helpers';

export type ServerToolkitItem = ResponseOf<'/v1/me/toolkit/{id}', 'put'>;
export type ServerToolUse = ResponseOf<'/v1/me/tool-uses/{id}', 'put'>;
export type ServerStressEntry = ResponseOf<'/v1/me/stress-entries/{id}', 'put'>;
export type SaveStressEntryBody = BodyOf<'/v1/me/stress-entries/{id}', 'put'>;
export type SaveCrisisPlanProgressBody = BodyOf<'/v1/me/crisis-plan-progress', 'put'>;
