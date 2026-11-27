import { type PlannedActivity, dayKey } from '@/features/activities/activities';
import type { PositiveEntry } from '@/features/beliefs/utils/beliefs';
import type { StressEntry, ToolUse } from '@/features/coping/copingStore';
import type { MoodEntry } from '@/features/mood/utils/moodLog';
import type { ThoughtRecord } from '@/features/thoughts/utils/thoughtLog';

/** Everything in the app that can count as doing a week's practice. */
export type PracticeData = {
  moods: MoodEntry[];
  thoughts: ThoughtRecord[];
  plans: PlannedActivity[];
  uses: ToolUse[];
  stress: StressEntry[];
  evidence: PositiveEntry[];
  /** Days ticked by hand, by session. */
  ticks: Record<string, string[]>;
};

const days = (isos: (string | undefined)[]) =>
  isos.flatMap((iso) => (iso ? [dayKey(new Date(iso))] : []));

/** What ticks a day by itself for each session's practice; the rest is ticked by hand. */
export const AUTO_TICK: Record<number, string> = {
  1: 'Logging your mood ticks the day.',
  2: 'Logging your mood or a thought diary ticks the day.',
  3: 'A thought record ticks the day.',
  4: 'Challenging a thought ticks the day.',
  5: 'Marking a planned activity done ticks the day.',
  6: 'Using a tool or logging stress ticks the day.',
  7: 'Adding evidence ticks the day.',
};

/** The days a session's practice was done, from what the student did plus any hand ticks. */
export function practiceDays(sessionId: number, data: PracticeData): Set<string> {
  const auto: string[] = (() => {
    switch (sessionId) {
      case 1:
        return days(data.moods.map((m) => m.at));
      case 2:
        return days([...data.moods.map((m) => m.at), ...data.thoughts.map((t) => t.at)]);
      case 3:
        return days(data.thoughts.map((t) => t.at));
      case 4:
        return days(data.thoughts.filter((t) => t.balanced).map((t) => t.at));
      case 5:
        return days(data.plans.map((p) => p.doneAt));
      case 6:
        return days([...data.uses.map((u) => u.at), ...data.stress.map((s) => s.at)]);
      case 7:
        return days(data.evidence.map((e) => e.at));
      default:
        return [];
    }
  })();
  return new Set([...auto, ...(data.ticks[sessionId] ?? [])]);
}

export function countIn(done: Set<string>, week: Date[]) {
  return week.filter((d) => done.has(dayKey(d))).length;
}
