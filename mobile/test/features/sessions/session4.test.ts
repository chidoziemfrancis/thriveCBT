import { describe, expect, it } from '@jest/globals';

import { summariseSession } from '@/features/researcher/sessionSummary';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_4 } from '@/features/sessions/content/session4';
import type { StepAnswer } from '@/features/sessions/content/types';
import {
  balancedText,
  isStepReady,
  readEvidence,
  reframeText,
  writeEvidence,
} from '@/features/sessions/sessionLogic';
import { CHALLENGE_RECAP, CHALLENGE_STEPS } from '@/features/thoughts/challengeSteps';
import { recordFromReframe } from '@/features/thoughts/thoughtLog';

const steps = SESSION_4.modules.flatMap((m) => m.steps);
const find = (id: string) => steps.find((s) => s.id === id)!;
const FRAME: [string, string, string] = ['Even though', 'I also know', 'So'];

const answers: Record<string, StepAnswer> = {
  'challenge-evidence': writeEvidence('I’ll never pass', ['I got 38%'], ['I passed two tests']),
  'challenge-true': 80,
  'challenge-balanced': ['I got 38%', 'I passed two tests', 'I can ask for help.'],
  'challenge-after': 40,
};

describe('session 4 content', () => {
  it('is registered with its five parts and unique step ids', () => {
    expect(sessionContent(4)).toBe(SESSION_4);
    expect(SESSION_4.modules.map((m) => m.id)).toEqual([
      'detective',
      'evidence',
      'questions',
      'balanced',
      'practice',
    ]);
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every practice question a picture and the balanced answer', () => {
    for (const id of ['p1', 'p2', 'p3']) {
      const q = find(id);
      expect(q.kind === 'choice' && q.picture && q.options[q.answer]).toBeTruthy();
    }
  });
});

describe('weighing the evidence', () => {
  it('keeps the thought and both sides, and needs evidence against to move on', () => {
    const saved = writeEvidence('I’m boring', ['Nobody replied'], ['Ada laughed at my joke']);
    expect(readEvidence(saved)).toEqual({
      thought: 'I’m boring',
      for: ['Nobody replied'],
      against: ['Ada laughed at my joke'],
    });
    const step = find('challenge-evidence');
    expect(isStepReady(step, writeEvidence('I’m boring', ['Nobody replied'], []))).toBe(false);
    expect(isStepReady(step, saved)).toBe(true);
  });
});

describe('the questions and the balanced thought', () => {
  it('needs all three outcome boxes filled', () => {
    const outcomes = find('challenge-outcomes');
    expect(isStepReady(outcomes, ['Fail', 'Top marks', ''])).toBe(false);
    expect(isStepReady(outcomes, ['Fail', 'Top marks', 'A pass'])).toBe(true);
  });

  it('reads the frame back as one sentence', () => {
    expect(balancedText(FRAME, ['I got 38%.', 'I passed two tests', 'I can ask for help.'])).toBe(
      'Even though I got 38%, I also know I passed two tests, so I can ask for help.'
    );
    expect(balancedText(FRAME, ['a', '', 'c'])).toBeNull();
  });
});

describe('saving the reframe', () => {
  it('records the balanced thought and how much belief dropped', () => {
    expect(recordFromReframe(CHALLENGE_RECAP, CHALLENGE_STEPS, answers)).toMatchObject({
      thought: 'I’ll never pass',
      beliefBefore: 80,
      beliefAfter: 40,
    });
    expect(reframeText(CHALLENGE_RECAP, CHALLENGE_STEPS, answers)).toContain(
      'Belief: 80% before, 40% after'
    );
  });

  it('shows the researcher the evidence, belief and balanced thought', () => {
    const lines = summariseSession(SESSION_4, {
      done: ['evidence', 'questions', 'balanced'],
      answers,
    }).flatMap((p) => p.lines);
    expect(lines).toEqual(
      expect.arrayContaining([
        { label: 'Thought checked', value: 'I’ll never pass' },
        { label: 'Evidence against', value: 'I passed two tests' },
        { label: 'Is this thought 100% true?', value: '80%' },
      ])
    );
    expect(lines.find((l) => l.label === 'Balanced thought')).toBeDefined();
  });
});
