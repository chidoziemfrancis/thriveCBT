import { usePlannedActivities } from '@/features/activities/store/activityStore';
import { usePositiveLog } from '@/features/beliefs/store/positiveLogStore';
import { useStressLog, useToolUses } from '@/features/coping/store/copingStore';
import { getMoodLog } from '@/features/mood/store/moodStore';
import { useThoughtLog } from '@/features/thoughts/store/thoughtLogStore';

import type { PracticeData } from './homework';
import { useHomeworkTicks } from './homeworkStore';

/** Everything that counts towards practice. Moods aren't a live store, so they're read each render. */
export function usePracticeData(): PracticeData {
  return {
    moods: getMoodLog(),
    thoughts: useThoughtLog(),
    plans: usePlannedActivities(),
    uses: useToolUses(),
    stress: useStressLog(),
    evidence: usePositiveLog(),
    ticks: useHomeworkTicks(),
  };
}
