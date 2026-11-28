import { Injectable } from '@nestjs/common';

import type { WellPlan } from '../../../../generated/prisma/client.js';
import { FieldCipher } from '../../../../shared/crypto/field-cipher.js';
import { assertNotStale } from '../../../../shared/sync/sync.js';
import type { SinceQuery } from '../../../../shared/sync/sync.dto.js';
import {
  type SaveWellPlan,
  type WellPlanContent,
  wellPlanContentSchema,
  type WellPlanDto,
  type WellPlanList,
} from '../dto/well-plan.dto.js';
import { WellPlanRepository } from '../repositories/well-plan.repository.js';

// The plan is all the student's own words, so it's stored as one encrypted value.
@Injectable()
export class WellPlanService {
  constructor(
    private readonly repository: WellPlanRepository,
    private readonly cipher: FieldCipher,
  ) {}

  private toDto(row: WellPlan): WellPlanDto {
    const content: WellPlanContent = wellPlanContentSchema.parse(
      JSON.parse(this.cipher.decrypt(row.data)),
    );
    return {
      ...content,
      updatedAt: row.updatedAt.toISOString(),
      deletedAt: null,
    };
  }

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<WellPlanList> {
    const row = await this.repository.find(studentId);
    const changed = row && (!since || row.syncedAt > new Date(since));
    return {
      items: changed ? [this.toDto(row)] : [],
      serverTime: now.toISOString(),
    };
  }

  async save(
    studentId: string,
    { updatedAt, ...content }: SaveWellPlan,
  ): Promise<WellPlanDto> {
    const saved = await this.repository.find(studentId);
    const at = new Date(updatedAt);
    assertNotStale(saved, at, () => saved && this.toDto(saved));
    return this.toDto(
      await this.repository.save(
        studentId,
        this.cipher.encrypt(JSON.stringify(content)),
        at,
      ),
    );
  }
}
