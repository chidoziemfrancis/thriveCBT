import type { User } from '../../../../generated/prisma/client.js';
import type { AccountsRepository } from '../repositories/accounts.repository.js';
import {
  AccountsService,
  normaliseEmail,
} from '../services/accounts.service.js';

function setup(users: Partial<User>[] = []) {
  const repository = {
    findByEmail: vi.fn(
      async (email: string) => users.find((u) => u.email === email) ?? null,
    ),
    findById: vi.fn(
      async (id: string) => users.find((u) => u.id === id) ?? null,
    ),
    createStudent: vi.fn(async (email: string, passwordHash: string) => ({
      id: 'new',
      email,
      passwordHash,
    })),
  };
  return {
    service: new AccountsService(repository as unknown as AccountsRepository),
    repository,
  };
}

describe('AccountsService', () => {
  it('trims and lowercases emails for lookups and new accounts', async () => {
    const { service, repository } = setup([{ id: 'u1', email: 'ada@uni.edu' }]);
    await expect(service.findByEmail('  Ada@Uni.EDU ')).resolves.toMatchObject({
      id: 'u1',
    });
    await service.createStudent(' New@Uni.edu', 'hash');
    expect(repository.createStudent).toHaveBeenCalledWith(
      'new@uni.edu',
      'hash',
    );
    expect(normaliseEmail(' A@B.C ')).toBe('a@b.c');
  });

  it('throws NOT_FOUND for an account that no longer exists', async () => {
    await expect(setup().service.getById('gone')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
