import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  AlertKind,
  Phq9Kind,
  type Phq9Result,
} from '../../../../generated/prisma/client.js';
import {
  ALERT_REQUESTED,
  AlertRequestedEvent,
} from '../../../../events/alert-requested.event.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { PHQ9_ERRORS } from '../../../../shared/errors/codes/phq9.errors.js';
import {
  PHQ9_BANDS,
  type Phq9ResultDto,
  type SubmitPhq9,
} from '../dto/phq9.dto.js';
import {
  FINAL_SESSION,
  SessionsService,
} from '../../../sessions/services/sessions.service.js';
import { Phq9Repository } from '../repositories/phq9.repository.js';

export const QUESTION_9 =
  'Thoughts that you would be better off dead, or of hurting yourself in some way';
export const ANSWER_LABELS = [
  'Not at all',
  'Several days',
  'More than half the days',
  'Nearly every day',
];
// Draft thresholds until the study team confirms them, matching the app's researcher side.
export const SEVERE_SCORE = 20;
export const REAL_RISE = 5;

export function phq9Score(answers: number[]): number {
  return answers.reduce((sum, answer) => sum + answer, 0);
}

export function phq9Band(score: number): (typeof PHQ9_BANDS)[number] {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately severe';
  return 'Severe';
}

/** The alerts a result raises: question 9, a severe score, and for the final one a real rise. */
export function phq9Alerts(
  result: Phq9Result,
  baselineScore?: number,
): AlertRequestedEvent[] {
  const final = result.kind === Phq9Kind.FINAL;
  const alerts: AlertRequestedEvent[] = [];
  if (result.item9 > 0) {
    alerts.push(
      new AlertRequestedEvent(
        result.studentId,
        AlertKind.QUESTION_9,
        true,
        final
          ? 'Answered question 9 above zero on the final PHQ-9'
          : 'Answered question 9 above zero',
        result.id,
        QUESTION_9,
        `Answer: ${ANSWER_LABELS[result.item9]}`,
      ),
    );
  }
  if (
    final &&
    baselineScore !== undefined &&
    result.score - baselineScore >= REAL_RISE
  ) {
    alerts.push(
      new AlertRequestedEvent(
        result.studentId,
        AlertKind.PHQ9_RISE,
        true,
        `Final PHQ-9 went up by ${result.score - baselineScore}`,
        result.id,
        undefined,
        `${baselineScore} at the start, ${result.score} at week 8`,
      ),
    );
  }
  if (result.score >= SEVERE_SCORE) {
    alerts.push(
      new AlertRequestedEvent(
        result.studentId,
        AlertKind.SEVERE,
        false,
        `Severe ${final ? 'final PHQ-9' : 'PHQ-9'} score (${result.score})`,
        result.id,
        undefined,
        `${result.score} of 27`,
      ),
    );
  }
  return alerts;
}

export function toPhq9Dto(result: Phq9Result): Phq9ResultDto {
  return {
    id: result.id,
    kind: result.kind === Phq9Kind.FINAL ? 'final' : 'baseline',
    score: result.score,
    band: phq9Band(result.score),
    needsSupport: result.item9 > 0,
    takenAt: result.takenAt.toISOString(),
  };
}

@Injectable()
export class Phq9Service {
  constructor(
    private readonly repository: Phq9Repository,
    private readonly events: EventEmitter2,
    private readonly sessions: SessionsService,
  ) {}

  async list(studentId: string): Promise<Phq9ResultDto[]> {
    return (await this.repository.list(studentId)).map(toPhq9Dto);
  }

  // Sending the same check-in again returns the saved result and re-checks its alerts, so a
  // retry after a dropped connection can never lose an alert.
  async submit(
    studentId: string,
    body: SubmitPhq9,
    now = new Date(),
  ): Promise<Phq9ResultDto> {
    const kind = body.kind === 'final' ? Phq9Kind.FINAL : Phq9Kind.BASELINE;
    const baseline =
      kind === Phq9Kind.FINAL
        ? await this.repository.find(studentId, Phq9Kind.BASELINE)
        : null;
    if (kind === Phq9Kind.FINAL && !baseline)
      throw new AppError(PHQ9_ERRORS.BASELINE_FIRST);

    const existing = await this.repository.find(studentId, kind);
    if (
      kind === Phq9Kind.FINAL &&
      !existing &&
      !(await this.sessions.hasFinished(studentId, FINAL_SESSION))
    )
      throw new AppError(PHQ9_ERRORS.FINAL_NOT_OPEN);

    const result =
      existing ??
      (await this.repository.create({
        studentId,
        kind,
        answers: body.answers,
        score: phq9Score(body.answers),
        item9: body.answers[8],
        takenAt: now,
      }));

    for (const alert of phq9Alerts(result, baseline?.score)) {
      await this.events.emitAsync(ALERT_REQUESTED, alert);
    }
    return toPhq9Dto(result);
  }
}
