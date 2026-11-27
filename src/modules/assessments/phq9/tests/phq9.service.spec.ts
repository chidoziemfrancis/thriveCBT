import type { EventEmitter2 } from '@nestjs/event-emitter';

import type { Phq9Result } from '../../../../generated/prisma/client.js';
import { submitPhq9Schema } from '../dto/phq9.dto.js';
import type { Phq9Repository } from '../repositories/phq9.repository.js';
import { phq9Alerts, phq9Band, Phq9Service } from '../services/phq9.service.js';

const NOW = new Date('2026-11-27T10:00:00Z');
const answers = (score: number, item9 = 0) => {
  const list = Array<number>(9).fill(0);
  list[8] = item9;
  let left = score - item9;
  for (let i = 0; left > 0; i = (i + 1) % 8) {
    if (list[i] < 3) {
      list[i] += 1;
      left -= 1;
    }
  }
  return list;
};

function setup() {
  const rows: Phq9Result[] = [];
  const repository = {
    find: vi.fn(
      async (studentId: string, kind: string) =>
        rows.find((r) => r.studentId === studentId && r.kind === kind) ?? null,
    ),
    list: vi.fn(async () => rows),
    create: vi.fn(
      async (data: Omit<Phq9Result, 'id' | 'createdAt' | 'updatedAt'>) => {
        const row = { ...data, id: `p${rows.length}` } as Phq9Result;
        rows.push(row);
        return row;
      },
    ),
  };
  const events = { emitAsync: vi.fn(async () => []) };
  const service = new Phq9Service(
    repository as unknown as Phq9Repository,
    events as unknown as EventEmitter2,
  );
  const kinds = () =>
    events.emitAsync.mock.calls
      .map((call) => (call as unknown[])[1] as { kind: string })
      .map((e) => e.kind);
  return { service, repository, events, kinds };
}

describe('phq9Band', () => {
  it.each([
    [0, 'Minimal'],
    [4, 'Minimal'],
    [5, 'Mild'],
    [10, 'Moderate'],
    [15, 'Moderately severe'],
    [20, 'Severe'],
    [27, 'Severe'],
  ] as const)('%i is %s', (score, band) => {
    expect(phq9Band(score)).toBe(band);
  });
});

describe('Phq9Service.submit', () => {
  it('scores on the server and returns the band, without asking the app for a score', async () => {
    const { service } = setup();
    await expect(
      service.submit('s1', { kind: 'baseline', answers: answers(12) }, NOW),
    ).resolves.toMatchObject({
      kind: 'baseline',
      score: 12,
      band: 'Moderate',
      needsSupport: false,
      takenAt: NOW.toISOString(),
    });
  });

  it('raises an urgent question 9 alert, and a severe score alert at 20 or more', async () => {
    const { service, kinds, events } = setup();
    const result = await service.submit(
      's1',
      { kind: 'baseline', answers: answers(21, 1) },
      NOW,
    );
    expect(result.needsSupport).toBe(true);
    expect(kinds()).toEqual(['QUESTION_9', 'SEVERE']);
    expect((events.emitAsync.mock.calls[0] as unknown[])[1]).toMatchObject({
      urgent: true,
      detail: 'Answer: Several days',
    });
  });

  it('raises nothing for a calm result', async () => {
    const { service, events } = setup();
    await service.submit('s1', { kind: 'baseline', answers: answers(6) }, NOW);
    expect(events.emitAsync).not.toHaveBeenCalled();
  });

  it('needs the baseline before the final, and alerts on a rise of 5 or more', async () => {
    const { service, kinds } = setup();
    await expect(
      service.submit('s1', { kind: 'final', answers: answers(10) }, NOW),
    ).rejects.toMatchObject({
      code: 'PHQ9_BASELINE_FIRST',
    });
    await service.submit('s1', { kind: 'baseline', answers: answers(8) }, NOW);
    await service.submit('s1', { kind: 'final', answers: answers(13) }, NOW);
    expect(kinds()).toEqual(['PHQ9_RISE']);
  });

  it('returns the saved result when sent again, and re-checks its alerts', async () => {
    const { service, repository, events } = setup();
    await service.submit(
      's1',
      { kind: 'baseline', answers: answers(3, 1) },
      NOW,
    );
    const again = await service.submit(
      's1',
      { kind: 'baseline', answers: answers(0) },
      NOW,
    );
    expect(again.score).toBe(3);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(events.emitAsync).toHaveBeenCalledTimes(2);
  });

  it('fails when an alert can’t be saved, so it is never lost silently', async () => {
    const { service, events } = setup();
    events.emitAsync.mockRejectedValueOnce(new Error('database down'));
    await expect(
      service.submit('s1', { kind: 'baseline', answers: answers(2, 2) }, NOW),
    ).rejects.toThrow('database down');
  });
});

describe('phq9Alerts', () => {
  it('words the final PHQ-9 alerts differently', () => {
    const result = {
      id: 'p1',
      studentId: 's1',
      kind: 'FINAL',
      score: 22,
      item9: 3,
    } as Phq9Result;
    expect(phq9Alerts(result, 10).map((a) => a.title)).toEqual([
      'Answered question 9 above zero on the final PHQ-9',
      'Final PHQ-9 went up by 12',
      'Severe final PHQ-9 score (22)',
    ]);
  });
});

describe('PHQ-9 checks', () => {
  it('need nine answers from 0 to 3', () => {
    expect(
      submitPhq9Schema.safeParse({ kind: 'baseline', answers: answers(5) })
        .success,
    ).toBe(true);
    expect(
      submitPhq9Schema.safeParse({ kind: 'baseline', answers: [1, 2, 3] })
        .success,
    ).toBe(false);
    expect(
      submitPhq9Schema.safeParse({
        kind: 'baseline',
        answers: [...answers(5).slice(0, 8), 4],
      }).success,
    ).toBe(false);
  });
});
