import { useMutation, useQueryClient } from '@tanstack/react-query';

import { onboardingKeys } from '@/features/onboarding/api/onboarding.service';
import type { ApiError } from '@/lib/api-error';

import { assessmentKeys, assessmentService } from '../api/assessment.service';
import { saveEpqrOnPhone } from '../store/epqrStore';
import { savePhq9OnPhone } from '../store/scoreHistory';
import type { ServerEpqr, ServerPhq9, SubmitPhq9 } from '../types/assessment.types';

export function useSubmitPhq9() {
  const queryClient = useQueryClient();
  return useMutation<ServerPhq9, ApiError, SubmitPhq9>({
    mutationFn: assessmentService.submitPhq9,
    onSuccess: (result) => {
      savePhq9OnPhone(result);
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.phq9() });
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
    },
  });
}

export function useSubmitEpqr() {
  const queryClient = useQueryClient();
  return useMutation<ServerEpqr, ApiError, boolean[]>({
    mutationFn: assessmentService.submitEpqr,
    onSuccess: (result) => {
      saveEpqrOnPhone(result);
      queryClient.setQueryData(assessmentKeys.epqr(), result);
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
    },
  });
}
