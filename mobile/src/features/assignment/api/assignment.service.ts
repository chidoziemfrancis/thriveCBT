import { api } from '@/lib/axios';

import type { Assignment, ResearcherCard } from '../types/assignment.types';

export const assignmentKeys = {
  mine: () => ['assignment', 'mine'] as const,
  code: (code: string) => ['assignment', 'code', code] as const,
};

export const assignmentService = {
  get: () => api.get<Assignment>('/me/assignment').then((r) => r.data),
  assign: (inviteCode?: string) =>
    api.post<Assignment>('/me/assignment', inviteCode ? { inviteCode } : {}).then((r) => r.data),
  previewCode: (code: string) =>
    api.get<ResearcherCard>(`/invite-codes/${encodeURIComponent(code)}`).then((r) => r.data),
};
