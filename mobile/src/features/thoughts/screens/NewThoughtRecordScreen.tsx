import { addJournalEntry } from '@/features/journal/journalStore';
import { diaryText } from '@/features/sessions/sessionLogic';
import StepFlow from '@/features/thoughts/components/StepFlow';
import { RECORD_RECAP, RECORD_STEPS } from '@/features/thoughts/recordSteps';
import { recordFromDiary } from '@/features/thoughts/thoughtLog';
import { addThoughtRecord } from '@/features/thoughts/thoughtLogStore';

/** A thought record outside any session, for catching thoughts as they happen during the week. */
export default function NewThoughtRecordScreen() {
  return (
    <StepFlow
      steps={RECORD_STEPS}
      saveLabel="Save to my thought log"
      onSave={(answers) => {
        const record = recordFromDiary(RECORD_RECAP, answers);
        const text = diaryText(RECORD_RECAP, answers);
        if (record) addThoughtRecord(record);
        if (text) addJournalEntry({ prompt: 'Thought record', text });
      }}
    />
  );
}
