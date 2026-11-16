import { usePlannedActivities } from '@/features/activities/activityStore';
import { usePositiveLog } from '@/features/beliefs/positiveLogStore';
import { useStressLog, useToolUses } from '@/features/coping/copingStore';
import { getMoodLog } from '@/features/mood/moodStore';
import { useThoughtLog } from '@/features/thoughts/thoughtLogStore';

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
