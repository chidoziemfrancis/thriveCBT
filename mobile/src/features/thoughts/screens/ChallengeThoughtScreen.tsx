import { addJournalEntry } from '@/features/journal/store/journalStore';
import { reframeText } from '@/features/sessions/utils/sessionLogic';
import { CHALLENGE_RECAP, CHALLENGE_STEPS } from '@/features/thoughts/constants/challengeSteps';
import StepFlow from '@/features/thoughts/components/StepFlow';
import { recordFromReframe } from '@/features/thoughts/utils/thoughtLog';
import { addThoughtRecord } from '@/features/thoughts/store/thoughtLogStore';

/** Weigh the evidence, ask the questions and build a balanced thought, any day of the week. */
export default function ChallengeThoughtScreen() {
  return (
    <StepFlow
      steps={CHALLENGE_STEPS}
      saveLabel="Save my balanced thought"
      onSave={(answers) => {
        const record = recordFromReframe(CHALLENGE_RECAP, CHALLENGE_STEPS, answers);
        const text = reframeText(CHALLENGE_RECAP, CHALLENGE_STEPS, answers);
        if (record) addThoughtRecord(record);
        if (text) addJournalEntry({ prompt: 'Challenged thought', text });
      }}
    />
  );
}
