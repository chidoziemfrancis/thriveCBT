import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { sessionContent } from '@/features/sessions/content';
import { SESSION_1 } from '@/features/sessions/content/session1';
import { MODULE_IMAGE } from '@/features/sessions/content/types';
import {
  modulesDone,
  nextModuleId,
  quizScore,
  sessionStatus,
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

describe('quizScore', () => {
  const quiz = SESSION_1.modules.find((m) => m.kind === 'quiz');
  const questions = quiz && quiz.kind === 'quiz' ? quiz.questions : [];

  it('counts correct answers', () => {
    const allRight = Object.fromEntries(questions.map((q) => [q.id, q.answer]));
    expect(quizScore(questions, allRight)).toBe(questions.length);
    expect(quizScore(questions, { [questions[0].id]: questions[0].answer })).toBe(1);
    expect(quizScore(questions, {})).toBe(0);
  });
});

describe('session 1 content', () => {
  it('is registered and has the four parts from the study plan', () => {
    expect(sessionContent(1)).toBe(SESSION_1);
    expect(SESSION_1.modules.map((m) => m.kind)).toEqual(['lesson', 'ratings', 'quiz', 'journal']);
    expect(sessionContent(2)).toBeUndefined();
  });

  it('has unique part ids, valid quiz answers and an image for every part', () => {
    const ids = SESSION_1.modules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    SESSION_1.modules.forEach((m) => {
      expect(MODULE_IMAGE[m.kind]).toBeDefined();
      if (m.kind === 'quiz') {
        m.questions.forEach((q) => expect(q.options[q.answer]).toBeDefined());
      }
    });
  });

  it('rates the five mood areas named in the study plan', () => {
    const ratings = SESSION_1.modules.find((m) => m.kind === 'ratings');
    expect(ratings && ratings.kind === 'ratings' && ratings.items.map((i) => i.id)).toEqual([
      'sadness',
      'motivation',
      'sleep',
      'energy',
      'concentration',
    ]);
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
