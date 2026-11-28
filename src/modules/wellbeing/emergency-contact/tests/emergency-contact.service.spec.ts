import type { EmergencyContact } from '../../../../generated/prisma/client.js';
import { FieldCipher } from '../../../../shared/crypto/field-cipher.js';
import { saveEmergencyContactSchema } from '../dto/emergency-contact.dto.js';
import type { EmergencyContactRepository } from '../repositories/emergency-contact.repository.js';
import { EmergencyContactService } from '../services/emergency-contact.service.js';

const T1 = '2026-11-28T10:00:00.000Z';
const T2 = '2026-11-28T11:00:00.000Z';
const T3 = '2026-11-28T12:00:00.000Z';

function setup() {
  let row: EmergencyContact | null = null;
  const repository = {
    find: vi.fn(async () => row),
    save: vi.fn(async (studentId: string, data: string, updatedAt: Date) => {
      row = {
        studentId,
        data,
        updatedAt,
        deletedAt: null,
        syncedAt: new Date(),
        createdAt: new Date(),
      };
      return row;
    }),
    markDeleted: vi.fn(async (_studentId: string, now: Date) => {
      row = { ...row!, data: null, updatedAt: now, deletedAt: now };
      return row;
    }),
  };
  const cipher = new FieldCipher(Buffer.alloc(32, 6).toString('base64'));
  return {
    service: new EmergencyContactService(
      repository as unknown as EmergencyContactRepository,
      cipher,
    ),
    stored: () => row,
  };
}

const contact = {
  name: 'Ngozi Eze',
  relationship: 'Aunt',
  phone: '0803 555 0101',
};

describe('EmergencyContactService', () => {
  it('stores the contact encrypted and gives it back', async () => {
    const { service, stored } = setup();
    await expect(
      service.save('s1', { ...contact, updatedAt: T1 }),
    ).resolves.toEqual({
      ...contact,
      updatedAt: T1,
      deletedAt: null,
    });
    expect(stored()!.data).toMatch(/^v1:/);
    expect(stored()!.data).not.toMatch(/Ngozi|0803/);
  });

  it('erases the details when removed, and takes a new contact added later', async () => {
    const { service, stored } = setup();
    await service.save('s1', { ...contact, updatedAt: T1 });
    await service.remove('s1', new Date(T2));
    expect(stored()!.data).toBeNull();
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ name: '', phone: '', deletedAt: T2 }],
    });
    await expect(
      service.save('s1', { ...contact, name: 'Tobi', updatedAt: T3 }),
    ).resolves.toMatchObject({ name: 'Tobi', deletedAt: null });
  });

  it('needs a name and a phone number', () => {
    expect(
      saveEmergencyContactSchema.safeParse({
        ...contact,
        name: ' ',
        updatedAt: T1,
      }).success,
    ).toBe(false);
    expect(
      saveEmergencyContactSchema.safeParse({
        ...contact,
        phone: '1',
        updatedAt: T1,
      }).success,
    ).toBe(false);
  });
});
