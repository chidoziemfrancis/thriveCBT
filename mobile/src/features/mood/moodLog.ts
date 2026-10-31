export type MoodEntry = { mood: number; at: string };

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** The latest mood logged on the given day, or null. Later entries replace earlier ones. */
export function moodOnDay(entries: MoodEntry[], day = new Date()): MoodEntry | null {
  const sameDayEntries = entries.filter((entry) => sameDay(new Date(entry.at), day));
  return sameDayEntries.length ? sameDayEntries[sameDayEntries.length - 1] : null;
}
