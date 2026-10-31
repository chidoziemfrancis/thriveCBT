import { describe, expect, it } from '@jest/globals';

import { Researcher, assignResearcher, firstName, initials } from '@/features/assignment/assign';

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

describe('assignResearcher', () => {
  it('sends an invited student to the inviting researcher, ignoring case and spaces', () => {
    expect(assignResearcher([ada, ben, cy], ' ada123 ')).toEqual({
      researcher: ada,
      method: 'invite',
    });
  });

  it('honours an invite even when that researcher is full', () => {
    const full = researcher({ id: 'full', inviteCode: 'FULL01', studentCount: 10 });
    expect(assignResearcher([full, ben], 'FULL01')?.researcher.id).toBe('full');
  });

  it('falls back to random assignment for an unknown invite code', () => {
    expect(assignResearcher([ada, ben], 'NOPE', () => 0)?.method).toBe('random');
  });

  it('picks only among researchers with the fewest students', () => {
    const picks = [0, 0.49, 0.5, 0.99].map(
      (r) => assignResearcher([ada, ben, cy], undefined, () => r)?.researcher.id
    );
    expect(picks).toEqual(['ben', 'ben', 'cy', 'cy']);
  });

  it('skips researchers who are full or not accepting', () => {
    const full = researcher({ id: 'full', capacity: 3, studentCount: 3 });
    const paused = researcher({ id: 'paused', accepting: false, studentCount: 0 });
    expect(assignResearcher([full, paused, ada], undefined, () => 0)?.researcher.id).toBe('ada');
  });

  it('returns null when nobody has space', () => {
    const full = researcher({ capacity: 1, studentCount: 1 });
    expect(assignResearcher([full])).toBeNull();
    expect(assignResearcher([])).toBeNull();
  });
});

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
