import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  COPING_CARDS,
  NOT_IN_BODY,
  crisisPlanFrom,
  planFilled,
  readContact,
  readTriggers,
  spotLabels,
  writeContact,
  writeTriggers,
} from '@/features/coping/coping';
import { CRISIS_STEPS, crisisAnswers } from '@/features/coping/copingSteps';
import { summariseSession } from '@/features/researcher/sessionSummary';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_6 } from '@/features/sessions/content/session6';
import { isStepReady } from '@/features/sessions/utils/sessionLogic';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

function loadStore() {
  let store!: typeof import('@/features/coping/copingStore');
  jest.isolateModules(() => {
    store = require('@/features/coping/copingStore');
  });
  return store;
}

beforeEach(() => mockMemory.clear());

const steps = SESSION_6.modules.flatMap((m) => m.steps);
const find = (id: string) => steps.find((s) => s.id === id)!;

describe('session 6 content', () => {
  it('is registered with its five parts and unique step ids', () => {
    expect(sessionContent(6)).toBe(SESSION_6);
    expect(SESSION_6.modules.map((m) => m.id)).toEqual([
      'stress',
      'triggers',
      'calm',
      'toolkit',
      'crisis',
    ]);
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SESSION_6.practiceAction).toBe('toolkit');
  });

  it('gives every coping card a unique id', () => {
    const ids = COPING_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('body map and triggers', () => {
  it('needs a spot picked, and names them for the researcher', () => {
    expect(isStepReady(find('body-map'), [])).toBe(false);
    expect(isStepReady(find('body-map'), ['chest'])).toBe(true);
    expect(spotLabels(['chest', 'hands'])).toEqual([
      'Racing heart, tight chest',
      'Shaky or sweaty hands',
    ]);
    expect(spotLabels([NOT_IN_BODY])).toEqual(['Not sure yet']);
  });

  it('needs every trigger rated', () => {
    const half = writeTriggers([{ label: 'Money', level: 8 }, { label: 'Exams and tests' }]);
    expect(isStepReady(find('my-triggers'), half)).toBe(false);
    const full = writeTriggers([
      { label: 'Money', level: 8 },
      { label: 'Exams and tests', level: 0 },
    ]);
    expect(isStepReady(find('my-triggers'), full)).toBe(true);
    expect(readTriggers(full)).toEqual([
      { label: 'Money', level: 8 },
      { label: 'Exams and tests', level: 0 },
    ]);
  });

  it('lets relaxation be skipped', () => {
    expect(isStepReady(find('box'), undefined)).toBe(true);
  });
});

describe('crisis plan', () => {
  const answers = {
    'crisis-warning': ['I stop eating properly'],
    'crisis-people': [writeContact('Mum', '0803 000 0000'), writeContact('Ada', '')],
    'crisis-safe': [],
  };

  it('needs something in the personal parts but not helplines or safety', () => {
    expect(isStepReady(find('crisis-warning'), [])).toBe(false);
    expect(isStepReady(find('crisis-pros'), [])).toBe(true);
    expect(isStepReady(find('crisis-safe'), [])).toBe(true);
  });

  it('builds the plan from the steps and back again for editing', () => {
    const plan = crisisPlanFrom(CRISIS_STEPS, answers);
    expect(plan).toEqual({
      warning: ['I stop eating properly'],
      people: ['Mum|0803 000 0000', 'Ada'],
    });
    expect(planFilled(plan)).toBe(2);
    expect(crisisAnswers(plan)).toEqual({
      'crisis-warning': ['I stop eating properly'],
      'crisis-people': ['Mum|0803 000 0000', 'Ada'],
    });
    expect(crisisPlanFrom(CRISIS_STEPS, {})).toBeNull();
  });

  it('reads contacts with and without a number', () => {
    expect(readContact('Mum|0803 000 0000')).toEqual({ name: 'Mum', phone: '0803 000 0000' });
    expect(readContact('Ada')).toEqual({ name: 'Ada', phone: undefined });
  });

  it('shows the researcher only that a plan was made', () => {
    const crisis = summariseSession(SESSION_6, { done: ['crisis'], answers }).find(
      (p) => p.id === 'crisis'
    )!;
    expect(crisis.lines).toEqual([
      { label: 'Crisis plan', value: 'Made a plan (2 of 6 parts filled)' },
    ]);
    expect(JSON.stringify(crisis)).not.toContain('Mum');
  });
});

describe('coping stores', () => {
  it('saves tools once and toggles them', () => {
    const store = loadStore();
    store.saveTools(['box', 'walk']);
    store.saveTools(['box', 'friend']);
    expect(store.getToolkit()).toEqual(['box', 'walk', 'friend']);
    store.toggleTool('walk');
    expect(store.getToolkit()).toEqual(['box', 'friend']);
  });

  it('logs stress, newest first', () => {
    const store = loadStore();
    store.addStressEntry({ situation: 'Exam', level: 70 }, new Date('2026-11-16T09:00:00Z'));
    store.addStressEntry({ situation: 'NEPA', helped: 'A walk' }, new Date('2026-11-16T10:00:00Z'));
    expect(store.getStressLog().map((e) => e.situation)).toEqual(['NEPA', 'Exam']);
  });

  it('keeps the crisis plan', () => {
    const store = loadStore();
    store.saveCrisisPlan({ warning: ['I stop replying'] });
    expect(loadStore().getCrisisPlan()).toEqual({ warning: ['I stop replying'] });
  });
});
