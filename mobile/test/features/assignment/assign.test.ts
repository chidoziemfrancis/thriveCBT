import { describe, expect, it } from '@jest/globals';

import { firstName, initials } from '@/features/assignment';
import { type Researcher } from '@/features/researcher/mockResearchers';

function researcher(overrides: Partial<Researcher>): Researcher {
  return {
    id: 'r',
    name: 'Test Researcher',
    title: 'Research assistant',
    bio: '',
    inviteCode: 'CODE',
    accepting: true,
    capacity: 10,
    studentCount: 0,
    ...overrides,
  };
}

const ada = researcher({ id: 'ada', inviteCode: 'ADA123', studentCount: 4 });
const ben = researcher({ id: 'ben', inviteCode: 'BEN123', studentCount: 2 });
const cy = researcher({ id: 'cy', inviteCode: 'CY1234', studentCount: 2 });

describe('initials', () => {
  it('drops titles and uses up to two names', () => {
    expect(initials('Dr. Amara Okafor')).toBe('AO');
    expect(initials('Tunde Bello')).toBe('TB');
    expect(initials('Grace')).toBe('G');
  });
});

describe('firstName', () => {
  it('drops titles and keeps the first name', () => {
    expect(firstName('Dr. Amara Okafor')).toBe('Amara');
    expect(firstName('Tunde Bello')).toBe('Tunde');
  });
});
