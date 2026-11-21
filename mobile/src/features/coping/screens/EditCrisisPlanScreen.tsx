import { crisisPlanFrom } from '@/features/coping/coping';
import { getCrisisPlan, saveCrisisPlan } from '@/features/coping/copingStore';
import { CRISIS_STEPS, crisisAnswers } from '@/features/coping/copingSteps';
import StepFlow from '@/features/thoughts/components/StepFlow';

export default function EditCrisisPlanScreen() {
  return (
    <StepFlow
      steps={CRISIS_STEPS}
      initial={crisisAnswers(getCrisisPlan())}
      saveLabel="Save my crisis plan"
      onSave={(answers) => {
        const plan = crisisPlanFrom(CRISIS_STEPS, answers);
        if (plan) saveCrisisPlan(plan);
      }}
    />
  );
}
