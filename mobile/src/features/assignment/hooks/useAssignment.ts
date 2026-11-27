import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { onboardingKeys } from '@/features/onboarding/api/onboarding.service';
import type { ApiError } from '@/lib/api-error';

import { assignmentKeys, assignmentService } from '../api/assignment.service';
import { saveAssignmentOnPhone } from '../store/assignmentStore';
import type { Assignment, ResearcherCard } from '../types/assignment.types';
import { normaliseCode } from '../utils/inviteCode';

export const MIN_CODE_LENGTH = 4;

export function useAssign() {
  const queryClient = useQueryClient();
  return useMutation<Assignment, ApiError, string | undefined>({
    mutationFn: assignmentService.assign,
    onSuccess: (assignment) => {
      saveAssignmentOnPhone(assignment);
      queryClient.setQueryData(assignmentKeys.mine(), assignment);
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
    },
  });
}

/** Who a typed invite code belongs to; asks only once the code is long enough to be real. */
export function useInviteCode(typed: string) {
  const code = normaliseCode(typed);
  return useQuery<ResearcherCard, ApiError>({
    queryKey: assignmentKeys.code(code),
    queryFn: () => assignmentService.previewCode(code),
    enabled: code.length >= MIN_CODE_LENGTH,
    staleTime: Infinity,
    retry: false,
  });
}
