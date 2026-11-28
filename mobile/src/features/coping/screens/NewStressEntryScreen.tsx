import { addStressEntry } from '@/features/coping/store/copingStore';
import { STRESS_STEPS } from '@/features/coping/constants/copingSteps';
import StepFlow from '@/features/thoughts/components/StepFlow';

/** What happened, how stressed it felt, and what helped. */
export default function NewStressEntryScreen() {
  return (
    <StepFlow
      steps={STRESS_STEPS}
      saveLabel="Save to my stress log"
      onSave={(answers) => {
        const text = (id: string) =>
          typeof answers[id] === 'string' ? (answers[id] as string).trim() : '';
        const level = answers['stress-level'];
        addStressEntry({
          situation: text('stress-situation'),
          level: typeof level === 'number' ? level : undefined,
          helped: text('stress-helped') || undefined,
        });
      }}
    />
  );
}
