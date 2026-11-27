import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/lib/storage', () => {
  const memory = new Map<string, unknown>();
  return {
    memory,
    readJson: (key: string, fallback: unknown) => (memory.has(key) ? memory.get(key) : fallback),
    writeJson: (key: string, value: unknown) => memory.set(key, value),
  };
});
const mockPost = jest.fn<(url: string, body: unknown) => Promise<{ data: unknown }>>();
jest.mock('@/lib/axios', () => ({
  api: { post: (url: string, body: unknown) => mockPost(url, body) },
}));

import { profileService } from '@/features/profile/api/profile.service';
import { getWithdrawal, saveWithdrawalOnPhone } from '@/features/profile/store/withdrawalStore';

beforeEach(() => {
  mockPost.mockReset();
});

describe('withdrawing', () => {
  it('sends the typed word and the reason to the server', async () => {
    mockPost.mockResolvedValue({ data: { at: '2026-11-27T09:00:00.000Z' } });
    await profileService.withdraw({ reason: 'Exams', confirm: 'WITHDRAW' });
    expect(mockPost).toHaveBeenCalledWith('/me/withdraw', { reason: 'Exams', confirm: 'WITHDRAW' });
  });

  it('keeps the date the server recorded on the phone', () => {
    saveWithdrawalOnPhone('2026-11-27T09:00:00.000Z', 'Exams');
    expect(getWithdrawal()).toEqual({ at: '2026-11-27T09:00:00.000Z', reason: 'Exams' });
  });
});
