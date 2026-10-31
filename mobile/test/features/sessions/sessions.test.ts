import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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
    expect(sessionContent(2)).toBeUndefined();
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
