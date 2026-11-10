import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { opensLabel, sessionOpensOn } from '@/features/home/studyWeek';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_1 } from '@/features/sessions/content/session1';
import type { SessionStep } from '@/features/sessions/content/types';
import {
  choiceScore,
  isStepReady,
  modulesDone,
  nextModuleId,
  sessionStatus,
  stepPosition,
} from '@/features/sessions/sessionLogic';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

beforeEach(() => mockMemory.clear());

describe('sessionStatus', () => {
  it('unlocks one session per study week', () => {
    expect(sessionStatus(1, 1, undefined)).toBe('current');
    expect(sessionStatus(2, 1, undefined)).toBe('locked');
    expect(sessionStatus(1, 3, undefined)).toBe('available');
    expect(sessionStatus(3, 3, { done: ['lesson'] })).toBe('current');
  });

  it('marks a finished session done even in a later week', () => {
    expect(sessionStatus(1, 4, { done: [], completedAt: '2026-10-29T10:00:00Z' })).toBe('done');
  });
});

describe('module progress', () => {
  it('walks the parts in order and finishes with null', () => {
    expect(nextModuleId(SESSION_1, undefined)).toBe('lesson');
    expect(nextModuleId(SESSION_1, { done: ['lesson'] })).toBe('mood-check');
    expect(nextModuleId(SESSION_1, { done: ['lesson', 'mood-check', 'quiz'] })).toBe('journal');
    expect(nextModuleId(SESSION_1, { done: SESSION_1.modules.map((m) => m.id) })).toBeNull();
  });

  it('counts only parts that belong to the session', () => {
    expect(modulesDone(SESSION_1, { done: ['lesson', 'quiz', 'not-a-part'] })).toBe(2);
    expect(modulesDone(SESSION_1, undefined)).toBe(0);
  });
});

const allSteps = SESSION_1.modules.flatMap((m) => m.steps);
const quizSteps = SESSION_1.modules.find((m) => m.id === 'quiz')?.steps ?? [];

describe('choiceScore', () => {
  it('counts correct multiple-choice answers', () => {
    const allRight = Object.fromEntries(
      quizSteps.flatMap((s) => (s.kind === 'choice' ? [[s.id, s.answer]] : []))
    );
    expect(choiceScore(quizSteps, allRight)).toBe(3);
    expect(choiceScore(quizSteps, { q1: 1 })).toBe(1);
    expect(choiceScore(quizSteps, {})).toBe(0);
  });
});

describe('stepPosition', () => {
  it('counts steps across every part, for one progress bar per session', () => {
    const total = allSteps.length;
    expect(stepPosition(SESSION_1, 'lesson', 0)).toEqual({ done: 0, total });
    const lessonLength = SESSION_1.modules[0].steps.length;
    expect(stepPosition(SESSION_1, 'mood-check', 2)).toEqual({ done: lessonLength + 2, total });
  });
});

describe('isStepReady', () => {
  const find = (kind: SessionStep['kind']) => allSteps.find((s) => s.kind === kind)!;

  it('lets reading, video and breathing steps continue straight away', () => {
    expect(isStepReady(find('info'), undefined)).toBe(true);
    expect(isStepReady(find('video'), undefined)).toBe(true);
    expect(isStepReady(find('breathe'), undefined)).toBe(true);
  });

  it('waits for every card to be revealed', () => {
    const reveal = find('reveal');
    const ids = reveal.kind === 'reveal' ? reveal.cards.map((c) => c.id) : [];
    expect(isStepReady(reveal, ids.slice(1))).toBe(false);
    expect(isStepReady(reveal, ids)).toBe(true);
  });

  it('waits for an answer on checklists, myths, choices and scales', () => {
    expect(isStepReady(find('checklist'), [])).toBe(false);
    expect(isStepReady(find('checklist'), [-1])).toBe(true);
    expect(isStepReady(find('mythFact'), undefined)).toBe(false);
    expect(isStepReady(find('mythFact'), false)).toBe(true);
    expect(isStepReady(find('choice'), 0)).toBe(true);
    expect(isStepReady(find('scale'), undefined)).toBe(false);
    expect(isStepReady(find('scale'), 3)).toBe(true);
  });

  it('needs some writing before a journal step continues', () => {
    expect(isStepReady(find('journal'), '   ')).toBe(false);
    expect(isStepReady(find('journal'), 'Sleep, mostly.')).toBe(true);
  });
});

describe('session 1 content', () => {
  it('is registered and keeps the four parts from the study plan', () => {
    expect(sessionContent(1)).toBe(SESSION_1);
    expect(SESSION_1.modules.map((m) => m.id)).toEqual(['lesson', 'mood-check', 'quiz', 'journal']);
    expect(sessionContent(4)).toBeUndefined();
  });

  it('has unique step ids and valid answers', () => {
    const ids = allSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    allSteps.forEach((s) => {
      if (s.kind === 'choice') expect(s.options[s.answer]).toBeDefined();
    });
  });

  // The lesson should be something to do, not just to read.
  it('mixes interactive steps into the lesson', () => {
    const kinds = new Set(SESSION_1.modules[0].steps.map((s) => s.kind));
    ['reveal', 'checklist', 'mythFact', 'breathe'].forEach((k) => expect(kinds).toContain(k));
  });

  it('rates the five mood areas named in the study plan', () => {
    const scales = allSteps.filter((s) => s.kind === 'scale').map((s) => s.id);
    expect(scales).toEqual(['sadness', 'motivation', 'sleep', 'energy', 'concentration']);
  });
});

describe('progress store', () => {
  it('records each part once and completes the session once', () => {
    jest.isolateModules(() => {
      const store =
        require('@/features/sessions/progressStore') as typeof import('@/features/sessions/progressStore');
      store.completeModule(1, 'lesson');
      store.completeModule(1, 'lesson');
      store.completeSession(1, new Date('2026-10-29T10:00:00Z'));
      store.completeSession(1, new Date('2026-11-05T10:00:00Z'));

      expect(mockMemory.get('session_progress')).toEqual({
        1: { done: ['lesson'], completedAt: '2026-10-29T10:00:00.000Z' },
      });
    });
  });
});

describe('when sessions open', () => {
  const joined = new Date(2026, 10, 3, 14, 30).toISOString();
  const now = new Date(2026, 10, 7, 9);

  it('opens each session a week apart from the day the student joined', () => {
    expect(sessionOpensOn(joined, 1, now)).toEqual(new Date(2026, 10, 3));
    expect(sessionOpensOn(joined, 3, now)).toEqual(new Date(2026, 10, 17));
  });

  it('says today, tomorrow, or the date', () => {
    expect(opensLabel(new Date(2026, 10, 7), now)).toBe('Opens today');
    expect(opensLabel(new Date(2026, 10, 8), now)).toBe('Opens tomorrow');
    expect(opensLabel(new Date(2026, 10, 17), now)).toMatch(/^Opens .*17/);
  });
});

describe('the redesigned Session 1', () => {
  const steps = SESSION_1.modules.flatMap((m) => m.steps);

  it('only moves on from the bad-day slider once time has been dragged to the end', () => {
    const compare = steps.find((s) => s.kind === 'compare')!;
    expect(isStepReady(compare, undefined)).toBe(false);
    expect(isStepReady(compare, true)).toBe(true);
  });

  it('places every "four ways" card on the body and gives every worry a photo', () => {
    const fourWays = steps.find((s) => s.id === 'four-ways');
    expect(fourWays?.kind === 'reveal' && fourWays.cards.every((c) => c.spot)).toBe(true);
    const pressures = steps.find((s) => s.id === 'pressures');
    expect(
      pressures?.kind === 'checklist' && pressures.photos?.length === pressures.options.length
    ).toBe(true);
  });

  it('keeps the step ids the researcher’s view and saved progress rely on', () => {
    const ids = steps.map((s) => s.id);
    for (const id of ['noticed', 'pressures', 'four-ways', 'q1', 'q2', 'q3', 'reflect']) {
      expect(ids).toContain(id);
    }
  });
});

describe('Session 1 parts 2 to 4', () => {
  const part = (id: string) => SESSION_1.modules.find((m) => m.id === id)!.steps;

  it('gives every check-in question a moving picture and a short name, then a recap', () => {
    const steps = part('mood-check');
    const scales = steps.filter((s) => s.kind === 'scale');
    expect(scales).toHaveLength(5);
    expect(scales.every((s) => s.kind === 'scale' && s.art && s.short)).toBe(true);
    expect(steps.at(-1)).toMatchObject({ kind: 'recap', of: 'scales' });
  });

  it('ends the quiz with its score and lets the recaps continue straight away', () => {
    const last = part('quiz').at(-1)!;
    expect(last).toMatchObject({ kind: 'recap', of: 'quiz' });
    expect(isStepReady(last, undefined)).toBe(true);
  });

  it('offers sentence starters for the reflection', () => {
    const reflect = part('journal').find((s) => s.id === 'reflect');
    expect(reflect?.kind === 'journal' && (reflect.starters?.length ?? 0) > 0).toBe(true);
  });
});
