import { describe, expect, it } from '@jest/globals';

import { summariseSession } from '@/features/researcher/sessionSummary';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_2 } from '@/features/sessions/content/session2';
import type { RecapStep, SortStep, StepAnswer } from '@/features/sessions/content/types';
import { emotionLabel } from '@/features/sessions/emotions';
import {
  FLIPPED,
  MISS,
  diaryText,
  isStepReady,
  sortProgress,
} from '@/features/sessions/sessionLogic';

const steps = SESSION_2.modules.flatMap((m) => m.steps);
const find = (id: string) => steps.find((s) => s.id === id)!;
const sort = find('sort') as SortStep;

describe('session 2 content', () => {
  it('is registered with the four parts and unique step ids', () => {
    expect(sessionContent(2)).toBe(SESSION_2);
    expect(SESSION_2.modules.map((m) => m.id)).toEqual(['triangle', 'spot', 'feelings', 'diary']);
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every story two thoughts, two feelings and two actions', () => {
    for (const scenario of sort.scenarios) {
      for (const part of ['thought', 'feeling', 'do'] as const) {
        expect(scenario.cards.filter((c) => c.part === part)).toHaveLength(2);
      }
    }
  });
});

describe('the triangle', () => {
  it('only moves on once the student has tried the kinder thought', () => {
    const loop = find('loop');
    expect(isStepReady(loop, ['thought', 'feeling', 'do'])).toBe(false);
    expect(isStepReady(loop, ['thought', 'feeling', 'do', FLIPPED])).toBe(true);
  });
});

describe('sortProgress', () => {
  it('walks through the chosen story card by card and counts first-time answers', () => {
    expect(sortProgress(sort, undefined)).toMatchObject({ scenario: undefined, done: false });
    const start = sortProgress(sort, ['exam']);
    expect(start.next?.id).toBe('exam-1');

    const answer = [
      'exam',
      'exam-1',
      `${MISS}exam-2`,
      'exam-2',
      'exam-3',
      'exam-4',
      'exam-5',
      'exam-6',
    ];
    const end = sortProgress(sort, answer);
    expect(end).toMatchObject({ done: true, firstTry: 5 });
    expect(isStepReady(sort, answer)).toBe(true);
    expect(isStepReady(sort, answer.slice(0, 4))).toBe(false);
  });
});

describe('feelings and the diary', () => {
  it('needs a family, a word and a strength', () => {
    const feel = find('name-feeling');
    expect(isStepReady(feel, ['anxious'])).toBe(false);
    expect(isStepReady(feel, ['anxious', 'Overwhelmed', '70'])).toBe(true);
    expect(emotionLabel(['anxious', 'Overwhelmed', '70'])).toBe('Overwhelmed (anxious), 70%');
    expect(emotionLabel(['made-up', 'x', '1'])).toBeNull();
  });

  it('turns the four diary answers into one journal entry', () => {
    const recap = find('diary-recap') as RecapStep;
    const answers: Record<string, StepAnswer> = {
      'diary-situation': ' In class, I got a question wrong ',
      'diary-thought': 'Everyone thinks I’m slow',
      'diary-feeling': ['ashamed', 'Embarrassed', '60'],
      'diary-action': 'Kept quiet for the rest of the class',
    };
    expect(diaryText(recap, answers)).toBe(
      [
        'What happened: In class, I got a question wrong',
        'What I thought: Everyone thinks I’m slow',
        'What I felt: Embarrassed (ashamed), 60%',
        'What I did: Kept quiet for the rest of the class',
      ].join('\n')
    );
    expect(diaryText(recap, {})).toBeNull();
  });
});

describe('what the researcher sees', () => {
  it('summarises the story, the sorting, the feeling and the diary in plain words', () => {
    const parts = summariseSession(SESSION_2, {
      done: ['triangle', 'spot'],
      answers: {
        loop: ['thought', 'feeling', 'do', FLIPPED],
        sort: ['seen', 'seen-1', 'seen-2', 'seen-3', 'seen-4', 'seen-5', 'seen-6'],
        'name-feeling': ['lonely', 'Ignored', '80'],
        'diary-thought': 'They don’t care',
      },
    });
    const lines = parts.flatMap((p) => p.lines);
    expect(lines).toEqual(
      expect.arrayContaining([
        { label: 'Follow the loop', value: 'Followed the loop and tried a different thought' },
        { label: 'Story picked', value: 'The message left on “Seen”' },
        { label: 'Sorted into thought, feeling, do', value: '6 of 6 right first time' },
        {
          label: 'Think of a moment this week that upset you. What did you feel?',
          value: 'Ignored (lonely), 80%',
        },
        { label: 'What went through your mind?', value: 'They don’t care' },
      ])
    );
  });
});
