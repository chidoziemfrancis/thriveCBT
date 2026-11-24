import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { alertStatus, handledIds, openAlerts, studentAlerts } from '@/features/researcher/alerts';
import { mockCaseload } from '@/features/researcher/caseload';
import { needsYou } from '@/features/researcher/todayLogic';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
}));

beforeEach(() => mockMemory.clear());

const now = new Date(2026, 10, 3, 13, 0);
const { students } = mockCaseload(now);
const tolu = students.find((s) => s.id === 's-tolu')!;

describe('studentAlerts', () => {
  it('raises question 9 and risk-word alerts as urgent, quoting what triggered them', () => {
    const alerts = studentAlerts(tolu, now);
    expect(alerts.map((a) => [a.kind, a.urgent])).toEqual([
      ['question9', true],
      ['riskWords', true],
    ]);
    expect(alerts[0].detail).toMatch(/^Answer:/);
    expect(alerts[1].quote).toMatch(/no reason to live/);
  });

  it('keeps the same id for the same event, so a handled alert stays handled', () => {
    expect(studentAlerts(tolu, now).map((a) => a.id)).toEqual(
      studentAlerts(mockCaseload(now).students[0], now).map((a) => a.id)
    );
  });
});

describe('openAlerts and needsYou', () => {
  it('drop alerts once they are handled', () => {
    const all = openAlerts(students, [], now);
    const toluIds = all.filter((a) => a.student.id === 's-tolu').map((a) => a.id);
    const rest = openAlerts(students, toluIds, now);
    expect(rest.some((a) => a.student.id === 's-tolu')).toBe(false);
    expect(needsYou(students, now, toluIds).some((n) => n.student.id === 's-tolu')).toBe(false);
  });

  it('lists each student once on Today, with their most serious open alert', () => {
    const items = needsYou(students, now);
    expect(new Set(items.map((i) => i.student.id)).size).toBe(items.length);
    expect(items[0]).toMatchObject({ urgent: true });
  });
});

describe('alert status', () => {
  it('is new, then acknowledged after any action, then handled', () => {
    expect(alertStatus([])).toBe('new');
    expect(alertStatus([{ type: 'note', at: '2026-11-03T10:00:00Z' }])).toBe('acknowledged');
    expect(
      alertStatus([
        { type: 'acknowledged', at: '2026-11-03T10:00:00Z' },
        { type: 'handled', at: '2026-11-03T11:00:00Z' },
      ])
    ).toBe('handled');
  });

  it('lists handled alert ids', () => {
    expect(
      handledIds({
        a: [{ type: 'handled', at: 'x' }],
        b: [{ type: 'note', at: 'x' }],
      })
    ).toEqual(['a']);
  });

  it('saves events in order, trimming notes', () => {
    jest.isolateModules(() => {
      const store =
        require('@/features/researcher/alertStore') as typeof import('@/features/researcher/alertStore');
      store.addAlertEvent('a1', 'acknowledged', undefined, now);
      store.addAlertEvent('a1', 'note', '  Called, safety plan agreed  ', now);
      expect(mockMemory.get('researcher_alerts')).toEqual({
        a1: [
          { type: 'acknowledged', at: now.toISOString() },
          { type: 'note', at: now.toISOString(), text: 'Called, safety plan agreed' },
        ],
      });
    });
  });
});

describe('EPQ-R question 76', () => {
  it('raises an urgent alert when a student answered Yes', () => {
    const student = tolu;
    const answers = Array(100).fill(false);
    answers[75] = true;
    const alerts = studentAlerts({ ...student, epqr: { answers, at: student.phq9.at } });
    const alert = alerts.find((a) => a.kind === 'epqrWish');
    expect(alert).toMatchObject({ urgent: true, detail: 'Answer: Yes' });
    expect(
      studentAlerts({
        ...student,
        epqr: { answers: Array(100).fill(false), at: student.phq9.at },
      }).some((a) => a.kind === 'epqrWish')
    ).toBe(false);
  });
});

describe('final PHQ-9', () => {
  const final = (score: number, item9 = 0) => ({
    answers: Array(9).fill(0),
    score,
    item9,
    at: '2026-11-02T18:00:00.000Z',
  });

  it('raises an urgent alert when the score rises by 5 or more', () => {
    const base = { ...tolu, phq9: { ...tolu.phq9, score: 12, item9: 0 }, messages: [] };
    const alert = studentAlerts({ ...base, phq9Final: final(17) }, now).find(
      (a) => a.kind === 'phq9Rise'
    );
    expect(alert).toMatchObject({ urgent: true, final: true, title: 'Final PHQ-9 went up by 5' });
    expect(
      studentAlerts({ ...base, phq9Final: final(16) }, now).some((a) => a.kind === 'phq9Rise')
    ).toBe(false);
  });

  it('raises question 9 on the final PHQ-9 with its own id', () => {
    const alerts = studentAlerts({ ...tolu, phq9Final: final(8, 1) }, now).filter(
      (a) => a.kind === 'question9'
    );
    expect(alerts.map((a) => a.final)).toEqual([true, false]);
    expect(new Set(alerts.map((a) => a.id)).size).toBe(2);
  });

  it('includes a mock student who has finished, with no alerts for an improved score', () => {
    const adaeze = students.find((s) => s.id === 's-adaeze')!;
    expect(adaeze.phq9Final?.score).toBeLessThan(adaeze.phq9.score);
    expect(studentAlerts(adaeze, now).some((a) => a.final)).toBe(false);
  });
});
