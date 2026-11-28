import { Injectable } from '@nestjs/common';

import type { CrisisPlanProgress } from '../../../../generated/prisma/client.js';
import { assertNotStale } from '../../../../shared/sync/sync.js';
import type {
  CrisisPlanProgressDto,
  SaveCrisisPlanProgress,
} from '../dto/crisis-plan-progress.dto.js';
import { CrisisPlanRepository } from '../repositories/crisis-plan.repository.js';

const toDto = (row: CrisisPlanProgress): CrisisPlanProgressDto => ({
  partsFilled: row.partsFilled,
  updatedAt: row.updatedAt.toISOString(),
});

// The plan itself never leaves the phone; the researcher only learns whether there is one.
@Injectable()
export class CrisisPlanService {
  constructor(private readonly repository: CrisisPlanRepository) {}

  async save(
    studentId: string,
    body: SaveCrisisPlanProgress,
  ): Promise<CrisisPlanProgressDto> {
    const saved = await this.repository.find(studentId);
    const updatedAt = new Date(body.updatedAt);
    assertNotStale(saved, updatedAt, () => saved && toDto(saved));
    return toDto(
      await this.repository.save(studentId, {
        partsFilled: body.partsFilled,
        updatedAt,
      }),
    );
  }
}
