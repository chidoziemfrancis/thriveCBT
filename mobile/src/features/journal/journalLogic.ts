import type { JournalEntry } from './journalStore';

export type EntryGroup = { title: string; entries: JournalEntry[] };

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mondayOf(date: Date) {
  const day = startOfDay(date);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDay() + 6) % 7));
}

function weekTitle(monday: Date, now: Date) {
  const thisMonday = mondayOf(now);
  const weeksAgo = Math.round((thisMonday.getTime() - monday.getTime()) / (7 * DAY_MS));
  if (weeksAgo === 0) return 'This week';
  if (weeksAgo === 1) return 'Last week';
  return `Week of ${monday.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

/** Newest first, grouped by calendar week (Monday to Sunday). */
export function groupByWeek(entries: JournalEntry[], now = new Date()): EntryGroup[] {
  const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  const groups: EntryGroup[] = [];
  for (const entry of sorted) {
    const title = weekTitle(mondayOf(new Date(entry.at)), now);
    const last = groups[groups.length - 1];
    if (last?.title === title) last.entries.push(entry);
    else groups.push({ title, entries: [entry] });
  }
  return groups;
}

/** The text on one line, cut at a word boundary so previews never end mid-word. */
export function excerpt(text: string, max = 110): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?]+$/, '')}…`;
}

/** "today", "yesterday", "3 days ago", or a date once it's over a week back. */
export function daysAgoLabel(iso: string, now = new Date()): string {
  const days = Math.round(
    (startOfDay(now).getTime() - startOfDay(new Date(iso)).getTime()) / DAY_MS
  );
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
