import type { ResponseOf } from '@/types/api-helpers';

export type ServerHomeworkTick = ResponseOf<'/v1/me/homework-ticks/{id}', 'put'>;
