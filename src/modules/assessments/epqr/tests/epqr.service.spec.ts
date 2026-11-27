import type { EventEmitter2 } from '@nestjs/event-emitter';

import type { EpqrResult } from '../../../../generated/prisma/client.js';
import { submitEpqrSchema } from '../dto/epqr.dto.js';
import type { EpqrRepository } from '../repositories/epqr.repository.js';
import { EPQR_KEY, EpqrService, epqrScores } from '../services/epqr.service.js';

const NOW = new Date('2026-11-27T10:00:00Z');
const allNo = () => Array<boolean>(100).fill(false);
const withYes = (...questions: number[]) => {
  const answers = allNo();
  for (const n of questions) answers[n - 1] = true;
  return answers;
};

function setup() {
  let saved: EpqrResult | null = null;
  const repository = {
    find: vi.fn(async () => saved),
    create: vi.fn(
      async (data: Omit<EpqrResult, 'id' | 'createdAt' | 'updatedAt'>) => {
        saved = { ...data, id: 'e1' } as EpqrResult;
        return saved;
      },
    ),
  };
  const events = { emitAsync: vi.fn(async () => []) };
  const service = new EpqrService(
    repository as unknown as EpqrRepository,
    events as unknown as EventEmitter2,
  );
  return { service, repository, events };
}

describe('EPQ-R scoring', () => {
  it('puts every question on exactly one scale, sized 32, 23, 24 and 21', () => {
    const all = Object.values(EPQR_KEY).flatMap((k) => [...k.yes, ...k.no]);
    expect(all.sort((a, b) => a - b)).toEqual(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
    const size = (s: keyof typeof EPQR_KEY) =>
      EPQR_KEY[s].yes.length + EPQR_KEY[s].no.length;
    expect([size('P'), size('E'), size('N'), size('L')]).toEqual([
      32, 23, 24, 21,
    ]);
  });

  it('counts keyed answers, both Yes and No', () => {
    expect(epqrScores(allNo())).toEqual({ P: 19, E: 3, N: 0, L: 15 });
    expect(epqrScores(withYes(1, 3, 25, 15))).toEqual({
      P: 20,
      E: 4,
      N: 1,
      L: 16,
    });
  });
});

describe('EpqrService', () => {
  it('saves the scores but only tells the student it was saved', async () => {
    const { service, repository } = setup();
    const result = await service.submit('s1', { answers: allNo() }, NOW);
    expect(result).toEqual({
      id: 'e1',
      needsSupport: false,
      takenAt: NOW.toISOString(),
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        psychoticism: 19,
        extraversion: 3,
        neuroticism: 0,
        lie: 15,
        wishedDead: false,
      }),
    );
  });

  it('raises an urgent alert for Yes to question 76, and none otherwise', async () => {
    const calm = setup();
    await calm.service.submit('s1', { answers: withYes(75, 77) }, NOW);
    expect(calm.events.emitAsync).not.toHaveBeenCalled();

    const { service, events } = setup();
    await expect(
      service.submit('s1', { answers: withYes(76) }, NOW),
    ).resolves.toMatchObject({ needsSupport: true });
    expect(events.emitAsync).toHaveBeenCalledWith(
      'alert.requested',
      expect.objectContaining({
        studentId: 's1',
        kind: 'EPQR_WISH',
        urgent: true,
        title: 'Answered Yes to EPQ-R question 76',
        quote: 'Have you ever wished that you were dead?',
        sourceId: 'e1',
      }),
    );
  });

  it('keeps the first answers when sent again, and re-checks the alert', async () => {
    const { service, repository, events } = setup();
    await service.submit('s1', { answers: withYes(76) }, NOW);
    await expect(
      service.submit('s1', { answers: allNo() }, NOW),
    ).resolves.toMatchObject({ id: 'e1', needsSupport: true });
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(events.emitAsync).toHaveBeenCalledTimes(2);
  });

  it('fails the request when the alert can’t be saved', async () => {
    const { service, events } = setup();
    events.emitAsync.mockRejectedValueOnce(new Error('database down'));
    await expect(
      service.submit('s1', { answers: withYes(76) }, NOW),
    ).rejects.toThrow('database down');
  });

  it('says when it hasn’t been taken yet', async () => {
    const { service } = setup();
    await expect(service.get('s1')).rejects.toMatchObject({
      code: 'EPQR_NOT_TAKEN',
    });
  });

  it('needs exactly 100 yes or no answers', () => {
    expect(submitEpqrSchema.safeParse({ answers: allNo() }).success).toBe(true);
    expect(
      submitEpqrSchema.safeParse({ answers: allNo().slice(1) }).success,
    ).toBe(false);
    expect(
      submitEpqrSchema.safeParse({ answers: [...allNo().slice(1), 1] }).success,
    ).toBe(false);
  });
});
