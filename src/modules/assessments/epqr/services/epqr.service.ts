import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  AlertKind,
  type EpqrResult,
} from '../../../../generated/prisma/client.js';
import {
  ALERT_REQUESTED,
  AlertRequestedEvent,
} from '../../../../events/alert-requested.event.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { EPQR_ERRORS } from '../../../../shared/errors/codes/epqr.errors.js';
import type { EpqrResultDto, SubmitEpqr } from '../dto/epqr.dto.js';
import { EpqrRepository } from '../repositories/epqr.repository.js';

export type EpqrScale = 'P' | 'E' | 'N' | 'L';

// The study team's scoring key, the same as the app's: question numbers (1 to 100) that score a
// point when answered Yes, or when answered No.
export const EPQR_KEY: Record<EpqrScale, { yes: number[]; no: number[] }> = {
  P: {
    yes: [25, 29, 30, 34, 37, 42, 48, 50, 56, 73, 75, 91, 95],
    no: [
      2, 5, 7, 9, 12, 14, 18, 21, 41, 54, 59, 64, 68, 79, 81, 85, 88, 96, 99,
    ],
  },
  E: {
    yes: [
      1, 6, 11, 16, 20, 28, 36, 40, 45, 51, 55, 58, 61, 63, 67, 69, 72, 78, 90,
      94,
    ],
    no: [24, 33, 47],
  },
  N: {
    yes: [
      3, 8, 13, 17, 22, 26, 31, 35, 38, 43, 46, 52, 60, 65, 70, 74, 76, 80, 83,
      84, 87, 92, 97, 100,
    ],
    no: [],
  },
  L: {
    yes: [15, 23, 39, 62, 86, 98],
    no: [4, 10, 19, 27, 32, 44, 49, 53, 57, 66, 71, 77, 82, 89, 93],
  },
};

export const WISHED_DEAD_QUESTION = 76;
export const WISHED_DEAD_TEXT = 'Have you ever wished that you were dead?';

export function epqrScores(answers: boolean[]): Record<EpqrScale, number> {
  const score = (scale: EpqrScale) =>
    EPQR_KEY[scale].yes.filter((n) => answers[n - 1] === true).length +
    EPQR_KEY[scale].no.filter((n) => answers[n - 1] === false).length;
  return { P: score('P'), E: score('E'), N: score('N'), L: score('L') };
}

export function epqrAlerts(result: EpqrResult): AlertRequestedEvent[] {
  if (!result.wishedDead) return [];
  return [
    new AlertRequestedEvent(
      result.studentId,
      AlertKind.EPQR_WISH,
      true,
      `Answered Yes to EPQ-R question ${WISHED_DEAD_QUESTION}`,
      result.id,
      WISHED_DEAD_TEXT,
      'Answer: Yes',
    ),
  ];
}

function toDto(result: EpqrResult): EpqrResultDto {
  return {
    id: result.id,
    needsSupport: result.wishedDead,
    takenAt: result.takenAt.toISOString(),
  };
}

@Injectable()
export class EpqrService {
  constructor(
    private readonly repository: EpqrRepository,
    private readonly events: EventEmitter2,
  ) {}

  async get(studentId: string): Promise<EpqrResultDto> {
    const result = await this.repository.find(studentId);
    if (!result) throw new AppError(EPQR_ERRORS.NOT_TAKEN);
    return toDto(result);
  }

  // Taken once. Sending again returns the saved result and re-checks its alert, so a retry after
  // a dropped connection can never lose one.
  async submit(
    studentId: string,
    { answers }: SubmitEpqr,
    now = new Date(),
  ): Promise<EpqrResultDto> {
    const scores = epqrScores(answers);
    const result =
      (await this.repository.find(studentId)) ??
      (await this.repository.create({
        studentId,
        answers,
        psychoticism: scores.P,
        extraversion: scores.E,
        neuroticism: scores.N,
        lie: scores.L,
        wishedDead: answers[WISHED_DEAD_QUESTION - 1],
        takenAt: now,
      }));

    for (const alert of epqrAlerts(result)) {
      await this.events.emitAsync(ALERT_REQUESTED, alert);
    }
    return toDto(result);
  }
}
