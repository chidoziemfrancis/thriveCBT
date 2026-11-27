import type { ResponseOf } from '@/types/api-helpers';

export type Assignment = ResponseOf<'/v1/me/assignment', 'get'>;
export type ResearcherCard = Assignment['researcher'];
