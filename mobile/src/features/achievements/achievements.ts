import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';
import type { MoodEntry } from '@/features/mood/moodLog';

// Modelled on GitHub's profile achievements: each one levels up through tiers, shown as ×2,
// ×3 and ×4 with bronze, silver and gold rims. Thresholds stay reachable in an 8-week study,
// because the point is to notice effort, not to rank anyone.

export type TierName = 'base' | 'bronze' | 'silver' | 'gold';
export const TIER_NAMES: TierName[] = ['base', 'bronze', 'silver', 'gold'];

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: FeatureIconName;
  tone: FeatureIconTone;
  /** Read as "12 moods logged", so singular and plural forms are both given. */
  unit: [one: string, many: string];
  thresholds: number[];
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'mood-tracker',
    title: 'Mood Tracker',
    description: 'Checked in with how you feel. Noticing your mood is the first CBT skill.',
    icon: 'heart',
    tone: 'peach',
    unit: ['mood logged', 'moods logged'],
    thresholds: [1, 7, 30, 56],
  },
  {
    id: 'streak-keeper',
    title: 'Streak Keeper',
    description: 'Logged your mood several days in a row. Small habits add up.',
    icon: 'sun',
    tone: 'butter',
    unit: ['day in a row', 'days in a row'],
    thresholds: [3, 7, 14, 28],
  },
  {
    id: 'learner',
    title: 'Learner',
    description: 'Finished sessions of the programme, one week at a time.',
    icon: 'play',
    tone: 'mint',
    unit: ['session done', 'sessions done'],
    thresholds: [1, 3, 5, 8],
  },
  {
    id: 'reflector',
    title: 'Reflector',
    description: 'Wrote in your journal. Putting thoughts into words helps untangle them.',
    icon: 'pencil',
    tone: 'lavender',
    unit: ['journal entry', 'journal entries'],
    thresholds: [1, 5, 15, 30],
  },
  {
    id: 'face-to-face',
    title: 'Face to Face',
    description: 'Showed up for a weekly check-in call with your researcher.',
    icon: 'video',
    tone: 'mint',
    unit: ['check-in call', 'check-in calls'],
    thresholds: [1, 3, 5, 8],
  },
  {
    id: 'open-up',
    title: 'Open Up',
    description: 'Sent your researcher a message. Reaching out takes courage.',
    icon: 'chat',
    tone: 'lavender',
    unit: ['message sent', 'messages sent'],
    thresholds: [1],
  },
];

/** When each thing happened, as ISO times. Moods are kept whole for streaks. */
export type AchievementActivity = {
  moods: MoodEntry[];
  sessions: string[];
  journal: string[];
  calls: string[];
  messages: string[];
};

export type AchievementState = {
  def: AchievementDef;
  count: number;
  /** 0 while locked, then 1 up to the number of tiers. */
  level: number;
  tier: TierName | null;
  /** The next threshold to reach, or null once the top tier is earned. */
  next: number | null;
  /** When the current tier was reached, or null while locked. */
  unlockedAt: string | null;
};

function dayStart(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * The longest run of consecutive days, and the day each run length was first reached. A run
 * can't get to 7 days without passing 7, so that day is when a threshold of 7 was crossed.
 */
function streakHistory(moods: MoodEntry[]) {
  const days = [...new Set(moods.map((m) => dayStart(m.at)))].sort((a, b) => a - b);
  const reachedAt = new Map<number, string>();
  let run = 0;
  days.forEach((day, i) => {
    const previous = new Date(day);
    previous.setDate(previous.getDate() - 1);
    run = i > 0 && days[i - 1] === previous.getTime() ? run + 1 : 1;
    if (!reachedAt.has(run)) reachedAt.set(run, new Date(day).toISOString());
  });
  return { best: Math.max(0, ...reachedAt.keys()), reachedAt };
}

function evaluate(def: AchievementDef, count: number, reachedAt: (n: number) => string | null) {
  const level = def.thresholds.filter((t) => count >= t).length;
  return {
    def,
    count,
    level,
    tier: level === 0 ? null : TIER_NAMES[level - 1],
    next: def.thresholds[level] ?? null,
    unlockedAt: level === 0 ? null : reachedAt(def.thresholds[level - 1]),
  };
}

/** Every achievement with its tier, progress and unlock date. */
export function achievementStates(activity: AchievementActivity): AchievementState[] {
  const streaks = streakHistory(activity.moods);
  // The nth event's time is when a threshold of n was crossed.
  const nth = (times: string[]) => {
    const sorted = [...times].sort();
    return (n: number) => sorted[n - 1] ?? null;
  };
  const counted: Record<string, string[]> = {
    'mood-tracker': activity.moods.map((m) => m.at),
    learner: activity.sessions,
    reflector: activity.journal,
    'face-to-face': activity.calls,
    'open-up': activity.messages,
  };

  return ACHIEVEMENTS.map((def) => {
    if (def.id === 'streak-keeper') {
      return evaluate(def, streaks.best, (n) => streaks.reachedAt.get(n) ?? null);
    }
    const times = counted[def.id] ?? [];
    return evaluate(def, times.length, nth(times));
  });
}

export function unitFor(def: AchievementDef, count: number) {
  return count === 1 ? def.unit[0] : def.unit[1];
}

export const TIER_LABEL: Record<TierName, string> = {
  base: 'Unlocked',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
};
