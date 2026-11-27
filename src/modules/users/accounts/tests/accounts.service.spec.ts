import type { User } from '../../../../generated/prisma/client.js';
import type { AccountsRepository } from '../repositories/accounts.repository.js';
import {
  AccountsService,
  inviteCodeCandidates,
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

describe('researcher invite codes', () => {
  it('match the app: up to five letters of the first name and a digit', () => {
    expect(inviteCodeCandidates('Grace Bello').slice(0, 2)).toEqual([
      'GRACE1',
      'GRACE2',
    ]);
    expect(inviteCodeCandidates('Oluwaseun')[0]).toBe('OLUWA1');
    expect(inviteCodeCandidates('  Ẹmeka ')[0]).toBe('EMEKA1');
  });

  it('falls back to a random code when the name is too short to use', () => {
    expect(inviteCodeCandidates('Al')).toEqual([]);
  });
});
