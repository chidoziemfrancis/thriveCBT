import { Injectable } from '@nestjs/common';

import type { EmergencyContact } from '../../../../generated/prisma/client.js';
import { FieldCipher } from '../../../../shared/crypto/field-cipher.js';
import { assertCanChange } from '../../../../shared/sync/sync.js';
import type { SinceQuery } from '../../../../shared/sync/sync.dto.js';
import {
  emergencyContactContentSchema,
  type EmergencyContactDto,
  type EmergencyContactList,
  type SaveEmergencyContact,
} from '../dto/emergency-contact.dto.js';
import { EmergencyContactRepository } from '../repositories/emergency-contact.repository.js';

const EMPTY = { name: '', relationship: '', phone: '' };

@Injectable()
export class EmergencyContactService {
  constructor(
    private readonly repository: EmergencyContactRepository,
    private readonly cipher: FieldCipher,
  ) {}

  private toDto(row: EmergencyContact): EmergencyContactDto {
    const content = row.data
      ? emergencyContactContentSchema.parse(
          JSON.parse(this.cipher.decrypt(row.data)),
        )
      : EMPTY;
    return {
      ...content,
      updatedAt: row.updatedAt.toISOString(),
      deletedAt: row.deletedAt?.toISOString() ?? null,
    };
  }

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<EmergencyContactList> {
    const row = await this.repository.find(studentId);
    const changed = row && (!since || row.syncedAt > new Date(since));
    return {
      items: changed ? [this.toDto(row)] : [],
      serverTime: now.toISOString(),
    };
  }

  // Adding a contact again after removing it brings it back, if the change is newer.
  async save(
    studentId: string,
    { updatedAt, ...content }: SaveEmergencyContact,
  ): Promise<EmergencyContactDto> {
    const saved = await this.repository.find(studentId);
    const at = new Date(updatedAt);
    assertCanChange(saved, studentId, at, () => saved && this.toDto(saved), {
      revive: true,
    });
    return this.toDto(
      await this.repository.save(
        studentId,
        this.cipher.encrypt(JSON.stringify(content)),
        at,
      ),
    );
  }

  async remove(studentId: string, now = new Date()): Promise<void> {
    const saved = await this.repository.find(studentId);
    if (saved && !saved.deletedAt)
      await this.repository.markDeleted(studentId, now);
  }
}
