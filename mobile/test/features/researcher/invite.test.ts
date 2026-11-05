import { describe, expect, it } from '@jest/globals';

import { MAX_CASELOAD, assignResearcher, researcherForCode } from '@/features/assignment/assign';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { inviteLink, inviteMessage } from '@/features/researcher/invite';

const grace = MOCK_RESEARCHERS.find((r) => r.id === 'r-grace')!;

describe('researcherForCode', () => {
  it('matches a code however it is typed', () => {
    expect(researcherForCode(MOCK_RESEARCHERS, ' grace 1 ')?.id).toBe('r-grace');
    expect(researcherForCode(MOCK_RESEARCHERS, 'GRACE1')?.id).toBe('r-grace');
  });

  it('finds nobody for an unknown or empty code', () => {
    expect(researcherForCode(MOCK_RESEARCHERS, 'NOPE99')).toBeUndefined();
    expect(researcherForCode(MOCK_RESEARCHERS, '  ')).toBeUndefined();
  });

  it('is what assignment uses for invited students', () => {
    expect(assignResearcher(MOCK_RESEARCHERS, 'grace1')).toMatchObject({
      researcher: { id: 'r-grace' },
      method: 'invite',
    });
  });
});

describe('invite link and message', () => {
  it('put the researcher’s code in the link and message', () => {
    expect(inviteLink(grace)).toMatch(/\/join\/GRACE1$/);
    expect(inviteMessage(grace)).toContain('Grace');
    expect(inviteMessage(grace)).toContain('GRACE1');
    expect(inviteMessage(grace)).toContain(inviteLink(grace));
  });
});

describe('caseload limit', () => {
  it('keeps every researcher at or under the study limit of 10', () => {
    expect(MAX_CASELOAD).toBe(10);
    for (const r of MOCK_RESEARCHERS) expect(r.capacity).toBeLessThanOrEqual(MAX_CASELOAD);
  });
});
