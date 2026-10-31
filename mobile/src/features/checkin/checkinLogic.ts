export type CheckIn = {
  id: string;
  researcherId: string;
  startsAt: string;
  durationMin: number;
};

export type CheckInFeedback = {
  checkInId: string;
  /** Null when the student skipped the question. */
  rating: number | null;
  note?: string;
  callSeconds: number;
  at: string;
};

/** Students can enter the lobby this many minutes early, like arriving a little before a class. */
export const JOIN_EARLY_MIN = 10;

export type CheckInPhase = 'upcoming' | 'joinable' | 'ended';

export function checkInPhase(checkIn: CheckIn, now = new Date()): CheckInPhase {
  const start = new Date(checkIn.startsAt).getTime();
  const opens = start - JOIN_EARLY_MIN * 60_000;
  const closes = start + checkIn.durationMin * 60_000;
  const t = now.getTime();
  if (t < opens) return 'upcoming';
  if (t <= closes) return 'joinable';
  return 'ended';
}

export function countdownLabel(startsAt: string, now = new Date()): string {
  const minutes = Math.round((new Date(startsAt).getTime() - now.getTime()) / 60_000);
  if (minutes <= 0) return 'Happening now';
  if (minutes < 60) return `Starts in ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Starts in ${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  return `Starts in ${days} day${days === 1 ? '' : 's'}`;
}

export function whenLabel(startsAt: string): string {
  const date = new Date(startsAt);
  const day = date.toLocaleDateString(undefined, { weekday: 'long' });
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day}, ${time}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
