import { describe, expect, it } from '@jest/globals';

import { summariseSession } from '@/features/researcher/sessionSummary';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_3 } from '@/features/sessions/content/session3';
import type { RecapStep, SortStep, StepAnswer } from '@/features/sessions/content/types';
import { diaryText, isStepReady, sortProgress } from '@/features/sessions/sessionLogic';
import { NOT_SURE, TRAPS, trapLabels } from '@/features/sessions/traps';

const steps = SESSION_3.modules.flatMap((m) => m.steps);
const find = (id: string) => steps.find((s) => s.id === id)!;
const match = find('match-traps') as SortStep;

describe('session 3 content', () => {
  it('is registered with its three parts and unique step ids', () => {
    expect(sessionContent(3)).toBe(SESSION_3);
    expect(SESSION_3.modules.map((m) => m.id)).toEqual(['traps', 'match', 'record']);
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows all four traps with pictures, and matches two thoughts to each', () => {
    const meet = find('meet-traps');
    expect(meet.kind === 'reveal' && meet.cards.every((c) => c.picture)).toBe(true);
    const cards = match.scenarios[0].cards;
    for (const trap of TRAPS) expect(cards.filter((c) => c.part === trap.id)).toHaveLength(2);
  });
});

describe('matching the traps', () => {
  it('starts sorting straight away when there is only one set of cards', () => {
    expect(sortProgress(match, undefined).next?.id).toBe('m1');
    const all = match.scenarios[0].cards.map((c) => c.id);
    expect(isStepReady(match, all)).toBe(true);
    expect(sortProgress(match, ['miss:m1', ...all]).firstTry).toBe(7);
  });
});

describe('tagging a thought', () => {
  it('needs at least one trap or "Not sure", and reads them back in plain words', () => {
    const traps = find('record-traps');
    expect(isStepReady(traps, [])).toBe(false);
    expect(isStepReady(traps, [NOT_SURE])).toBe(true);
    expect(trapLabels(['mind-reading', NOT_SURE, 'made-up'])).toEqual(['Mind reading', 'Not sure']);
  });

  it('adds the traps to the saved thought record', () => {
    const recap = find('record-recap') as RecapStep;
    const answers: Record<string, StepAnswer> = {
      'record-situation': 'Online, nobody liked my post',
      'record-thought': 'Nobody cares about me',
      'record-feeling': ['lonely', 'Ignored', '70'],
      'record-traps': ['mind-reading', 'overgeneralising'],
    };
    expect(diaryText(recap, answers)).toBe(
      [
        'What happened: Online, nobody liked my post',
        'What I thought: Nobody cares about me',
        'What I felt: Ignored (lonely), 70%',
        'Thinking trap: Mind reading, Overgeneralising',
      ].join('\n')
    );
  });
});

describe('what the researcher sees', () => {
  it('shows the matching score and the traps tagged', () => {
    const all = match.scenarios[0].cards.map((c) => c.id);
    const lines = summariseSession(SESSION_3, {
      done: ['traps', 'match', 'record'],
      answers: { 'match-traps': all, 'record-traps': ['catastrophising'] },
    }).flatMap((p) => p.lines);
    expect(lines).toEqual(
      expect.arrayContaining([
        { label: 'Thinking traps matched', value: '8 of 8 right first time' },
        { label: 'Which trap might it be?', value: 'Catastrophising' },
      ])
    );
    expect(lines.find((l) => l.label === 'Story picked')).toBeUndefined();
  });
});
