import { describe, expect, it } from '@jest/globals';

import { summariseSession } from '@/features/researcher/sessionSummary';
import { SESSION_1 } from '@/features/sessions/content/session1';
import { CHECKLIST_NONE } from '@/features/sessions/content/types';

const allParts = ['lesson', 'mood-check', 'quiz', 'journal'];

describe('summariseSession', () => {
  it('describes every part of a finished session in plain words', () => {
    const parts = summariseSession(SESSION_1, {
      done: allParts,
      completedAt: '2026-10-27T19:00:00.000Z',
      answers: {
        'myth-sad': false,
        'four-ways': ['thoughts', 'feelings', 'body', 'behaviour'],
        noticed: [0, 2],
        pressures: [CHECKLIST_NONE],
        breathe: true,
        'myth-weak': true,
        sadness: 4,
        q1: 1,
        q2: 1,
        q3: 0,
        reflect: '  Mostly my sleep.  ',
      },
    });

    expect(parts.map((p) => [p.id, p.done])).toEqual(allParts.map((id) => [id, true]));
    const lesson = Object.fromEntries(parts[0].lines.map((l) => [l.label, l.value]));
    expect(lesson['Have you noticed any of these lately?']).toBe(
      'Low mood most days, Changes in sleep'
    );
    expect(lesson['What weighs on you most right now?']).toBe('None of these');
    expect(lesson['It shows up in four ways']).toBe('Opened all 4 cards');
    expect(lesson['Breathing exercise']).toBe('Completed');
    expect(Object.values(lesson)).toEqual(
      expect.arrayContaining(['Called it right', 'Called it wrong'])
    );

    expect(parts[1].lines).toEqual([{ label: 'How sad have you felt?', value: '4 / 5' }]);
    expect(parts[2].lines).toEqual([{ label: 'Score', value: '2 of 3 correct' }]);
    expect(parts[3].reflection).toBe('Mostly my sleep.');
  });

  it('marks breathing as skipped once the part is done without it', () => {
    const [lesson] = summariseSession(SESSION_1, { done: ['lesson'], answers: {} });
    expect(lesson.lines).toContainEqual({ label: 'Breathing exercise', value: 'Skipped' });
  });

  it('leaves parts that haven’t been reached empty and not done', () => {
    const parts = summariseSession(SESSION_1, undefined);
    expect(parts.every((p) => !p.done && p.lines.length === 0 && !p.reflection)).toBe(true);
  });
});
