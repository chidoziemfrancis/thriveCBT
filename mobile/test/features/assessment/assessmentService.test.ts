import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockGet = jest.fn<(url: string) => Promise<{ data: unknown }>>();
const mockPost = jest.fn<(url: string, body: unknown) => Promise<{ data: unknown }>>();
jest.mock('@/lib/axios', () => ({
  api: {
    get: (url: string) => mockGet(url),
    post: (url: string, body: unknown) => mockPost(url, body),
  },
}));

import { assessmentService } from '@/features/assessment';

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('assessmentService', () => {
  it('sends PHQ-9 answers, never a score', async () => {
    mockPost.mockResolvedValue({ data: { id: 'p1' } });
    const answers = [1, 1, 1, 1, 1, 1, 1, 1, 0];
    await assessmentService.submitPhq9({ kind: 'baseline', answers });
    expect(mockPost).toHaveBeenCalledWith('/me/phq9', { kind: 'baseline', answers });
  });

  it('reads the list of PHQ-9 results out of items', async () => {
    mockGet.mockResolvedValue({ data: { items: [{ id: 'p1' }] } });
    await expect(assessmentService.listPhq9()).resolves.toEqual([{ id: 'p1' }]);
  });

  it('sends the 100 EPQ-R answers as they are', async () => {
    mockPost.mockResolvedValue({ data: { id: 'e1' } });
    const answers = Array<boolean>(100).fill(false);
    await assessmentService.submitEpqr(answers);
    expect(mockPost).toHaveBeenCalledWith('/me/epqr', { answers });
  });
});
