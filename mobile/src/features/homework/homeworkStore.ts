import { dayKey } from '@/features/activities/utils/activities';
import { createStore } from '@/lib/createStore';
import { onStudentChange } from '@/lib/sync';

const ticks = createStore<Record<string, string[]>>('homework_ticks', {});

export const useHomeworkTicks = ticks.use;
export const getHomeworkTicks = ticks.get;

/** Marks or unmarks a day's practice by hand. */
export function toggleTick(sessionId: number, day = dayKey(new Date())) {
  const all = ticks.get();
  const current = all[sessionId] ?? [];
  ticks.set({
    ...all,
    [sessionId]: current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
  });
}

onStudentChange(() => ticks.set({}));
