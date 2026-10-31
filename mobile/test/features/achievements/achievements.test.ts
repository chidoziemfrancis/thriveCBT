import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  ACHIEVEMENTS,
  AchievementActivity,
  achievementStates,
  unitFor,
} from '@/features/achievements/achievements';
import {
  getSeenLevels,
  isNewUnlock,
  markAchievementSeen,
} from '@/features/achievements/achievementsSeen';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
}));

beforeEach(() => mockMemory.clear());

function day(n: number, hour = 9) {
  return new Date(2026, 9, n, hour).toISOString();
}

const empty: AchievementActivity = {
  moods: [],
  sessions: [],
  journal: [],
  calls: [],
  messages: [],
};

function stateOf(id: string, activity: Partial<AchievementActivity>) {
  return achievementStates({ ...empty, ...activity }).find((a) => a.def.id === id)!;
}

describe('achievementStates', () => {
  it('starts with everything locked', () => {
    const states = achievementStates(empty);
    expect(states).toHaveLength(ACHIEVEMENTS.length);
    expect(states.every((s) => s.level === 0 && s.tier === null && s.unlockedAt === null)).toBe(
      true
    );
  });

  it('levels up through the tiers, GitHub style', () => {
    const journal = (n: number) => Array.from({ length: n }, (_, i) => day(i + 1));
    expect(stateOf('reflector', { journal: journal(1) })).toMatchObject({
      level: 1,
      tier: 'base',
      next: 5,
    });
    expect(stateOf('reflector', { journal: journal(5) })).toMatchObject({
      level: 2,
      tier: 'bronze',
      next: 15,
    });
    expect(stateOf('reflector', { journal: journal(15) })).toMatchObject({ tier: 'silver' });
    expect(stateOf('reflector', { journal: journal(31) })).toMatchObject({
      tier: 'gold',
      next: null,
    });
  });

  it('dates an unlock to when the threshold was crossed, whatever the order', () => {
    const state = stateOf('learner', { sessions: [day(20), day(3), day(10), day(5)] });
    // Three sessions reaches bronze; the third, in time order, was on day 10.
    expect(state).toMatchObject({ tier: 'bronze', unlockedAt: day(10) });
  });

  it('measures streaks by consecutive days and dates them to the day they were reached', () => {
    const moods = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11].map((n) => ({ mood: 2, at: day(n, 20) }));
    const state = stateOf('streak-keeper', { moods });
    expect(state.count).toBe(7);
    expect(state).toMatchObject({ tier: 'bronze', next: 14 });
    expect(new Date(state.unlockedAt!).getDate()).toBe(11);
  });

  it('counts two moods on one day once for streaks, but twice as moods logged', () => {
    const moods = [
      { mood: 1, at: day(1, 8) },
      { mood: 3, at: day(1, 20) },
    ];
    expect(stateOf('streak-keeper', { moods }).count).toBe(1);
    expect(stateOf('mood-tracker', { moods }).count).toBe(2);
  });

  it('handles single-tier achievements', () => {
    expect(stateOf('open-up', { messages: [day(4)] })).toMatchObject({ level: 1, next: null });
  });
});

describe('unitFor', () => {
  it('picks singular or plural', () => {
    const def = ACHIEVEMENTS.find((a) => a.id === 'reflector')!;
    expect(unitFor(def, 1)).toBe('journal entry');
    expect(unitFor(def, 3)).toBe('journal entries');
  });
});

describe('seen achievements', () => {
  it('marks a tier as new until it has been opened', () => {
    expect(isNewUnlock(getSeenLevels(), 'learner', 1)).toBe(true);
    markAchievementSeen('learner', 1);
    expect(isNewUnlock(getSeenLevels(), 'learner', 1)).toBe(false);
    expect(isNewUnlock(getSeenLevels(), 'learner', 2)).toBe(true);
  });

  it('never lowers a seen tier', () => {
    markAchievementSeen('learner', 3);
    markAchievementSeen('learner', 1);
    expect(getSeenLevels().learner).toBe(3);
  });
});
