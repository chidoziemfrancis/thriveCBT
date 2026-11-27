import { Injectable } from '@nestjs/common';

import type { SessionProgress } from '../../../generated/prisma/client.js';
import { assertNotStale } from '../../../shared/sync/sync.js';
import type { SinceQuery } from '../../../shared/sync/sync.dto.js';
import type {
  SaveSession,
  SessionDto,
  SessionList,
} from '../dto/session.dto.js';
import { SessionsRepository } from '../repositories/sessions.repository.js';

export const FINAL_SESSION = 8;

function toDto(row: SessionProgress): SessionDto {
  return {
    sessionId: row.sessionId,
    done: row.done,
    answers: row.answers as SessionDto['answers'],
    completedAt: row.completedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class SessionsService {
  constructor(private readonly repository: SessionsRepository) {}

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<SessionList> {
    const rows = await this.repository.changedSince(
      studentId,
      since ? new Date(since) : undefined,
    );
    return { items: rows.map(toDto), serverTime: now.toISOString() };
  }

  // The phone sends the whole record; the newest change wins. A session, once finished, stays
  // finished, whatever an older phone sends later.
  async save(
    studentId: string,
    sessionId: number,
    body: SaveSession,
  ): Promise<SessionDto> {
    const saved = await this.repository.find(studentId, sessionId);
    const updatedAt = new Date(body.updatedAt);
    assertNotStale(saved, updatedAt, () => saved && toDto(saved));

    const completedAt = body.completedAt
      ? new Date(body.completedAt)
      : (saved?.completedAt ?? null);
    return toDto(
      await this.repository.save(studentId, sessionId, {
        done: [...new Set(body.done)],
        answers: body.answers,
        completedAt,
        updatedAt,
      }),
    );
  }

  async hasFinished(studentId: string, sessionId: number): Promise<boolean> {
    return Boolean(
      (await this.repository.find(studentId, sessionId))?.completedAt,
    );
  }
}
