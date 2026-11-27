import { describe, expect, it } from '@jest/globals';

import { MAX_CASELOAD } from '@/features/researcher/mockResearchers';
import { MOCK_RESEARCHERS } from '@/features/researcher/mockResearchers';
import { inviteLink, inviteMessage } from '@/features/researcher/invite';

const grace = MOCK_RESEARCHERS.find((r) => r.id === 'r-grace')!;

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
