import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/lib/storage', () => {
  const memory = new Map<string, unknown>();
  return {
    memory,
    readJson: (key: string, fallback: unknown) => (memory.has(key) ? memory.get(key) : fallback),
    writeJson: (key: string, value: unknown) => memory.set(key, value),
    removeKey: (key: string) => memory.delete(key),
  };
});

const mockGet = jest.fn<(url: string) => Promise<{ data: unknown }>>();
const mockPost = jest.fn<(url: string, body: unknown) => Promise<{ data: unknown }>>();
jest.mock('@/lib/axios', () => ({
  api: {
    get: (url: string) => mockGet(url),
    post: (url: string, body: unknown) => mockPost(url, body),
  },
}));

import {
  assignmentService,
  getAssignment,
  getMyResearcher,
  saveAssignmentOnPhone,
} from '@/features/assignment';
import { normaliseCode } from '@/features/assignment/utils/inviteCode';

const mockMemory = (jest.requireMock('@/lib/storage') as { memory: Map<string, unknown> }).memory;
const match = {
  researcher: { id: 'r1', name: 'Grace Bello', title: null, bio: null },
  method: 'invite' as const,
  assignedAt: '2026-11-27T08:10:00.000Z',
};

beforeEach(() => {
  mockMemory.clear();
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('assignmentService', () => {
  it('sends the invite code only when there is one', async () => {
    mockPost.mockResolvedValue({ data: match });
    await assignmentService.assign('GRACE1');
    await assignmentService.assign(undefined);
    expect(mockPost).toHaveBeenNthCalledWith(1, '/me/assignment', { inviteCode: 'GRACE1' });
    expect(mockPost).toHaveBeenNthCalledWith(2, '/me/assignment', {});
  });

  it('looks a code up safely in the URL', async () => {
    mockGet.mockResolvedValue({ data: match.researcher });
    await assignmentService.previewCode('GR/ACE');
    expect(mockGet).toHaveBeenCalledWith('/invite-codes/GR%2FACE');
  });
});

describe('invite codes', () => {
  it('ignore case and spaces, as the server does', () => {
    expect(normaliseCode(' grace 1 ')).toBe('GRACE1');
  });
});

describe('the match on the phone', () => {
  it('keeps the researcher from the server', () => {
    saveAssignmentOnPhone(match);
    expect(getMyResearcher()).toEqual(match.researcher);
  });

  it('ignores anything that isn’t a server match', () => {
    mockMemory.set('researcher_match', { researcherId: 'r-grace', method: 'random' });
    expect(getAssignment()).toBeNull();
    expect(getMyResearcher()).toBeUndefined();
  });
});
