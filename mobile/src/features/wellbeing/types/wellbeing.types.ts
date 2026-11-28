import type { ResponseOf } from '@/types/api-helpers';

export type ServerWellPlan = ResponseOf<'/v1/me/well-plan', 'put'>;
