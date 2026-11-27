import { api } from '@/lib/axios';

import type { ServerEpqr, ServerPhq9, SubmitPhq9 } from '../types/assessment.types';

export const assessmentKeys = {
  phq9: () => ['assessment', 'phq9'] as const,
  epqr: () => ['assessment', 'epqr'] as const,
};

export const assessmentService = {
  listPhq9: () => api.get<{ items: ServerPhq9[] }>('/me/phq9').then((r) => r.data.items),
  submitPhq9: (body: SubmitPhq9) => api.post<ServerPhq9>('/me/phq9', body).then((r) => r.data),
  getEpqr: () => api.get<ServerEpqr>('/me/epqr').then((r) => r.data),
  submitEpqr: (answers: boolean[]) =>
    api.post<ServerEpqr>('/me/epqr', { answers }).then((r) => r.data),
};
