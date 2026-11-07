export type MoodEntry = { mood: number; at: string; note?: string };

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

/** The day's mood that carries a note, newest first, one per day. */
export function moodNotes(entries: MoodEntry[], limit = 5): MoodEntry[] {
  const seen = new Set<string>();
  const notes: MoodEntry[] = [];
  for (const entry of [...entries].reverse()) {
    const day = new Date(entry.at).toDateString();
    if (seen.has(day)) continue;
    seen.add(day);
    if (entry.note) notes.push(entry);
    if (notes.length === limit) break;
  }
  return notes;
}
