export type Researcher = {
  id: string;
  name: string;
  title: string;
  bio: string;
  inviteCode: string;
  accepting: boolean;
  capacity: number;
  studentCount: number;
};

export type AssignmentMethod = 'invite' | 'random';

export type Assignment = { researcher: Researcher; method: AssignmentMethod };

function hasSpace(researcher: Researcher) {
  return researcher.accepting && researcher.studentCount < researcher.capacity;
}

/**
 * An invite always goes to the inviting researcher, since they chose this student. Otherwise
 * pick at random among researchers with space, limited to those with the fewest students so
 * caseloads stay even. Returns null when nobody has space.
 */
export function assignResearcher(
  researchers: Researcher[],
  inviteCode?: string,
  random: () => number = Math.random
): Assignment | null {
  const code = inviteCode?.trim().toUpperCase();
  if (code) {
    const inviter = researchers.find((r) => r.inviteCode.toUpperCase() === code);
    if (inviter) return { researcher: inviter, method: 'invite' };
  }

  const open = researchers.filter(hasSpace);
  if (open.length === 0) return null;

  const fewest = Math.min(...open.map((r) => r.studentCount));
  const candidates = open.filter((r) => r.studentCount === fewest);
  const index = Math.min(Math.floor(random() * candidates.length), candidates.length - 1);
  return { researcher: candidates[index], method: 'random' };
}

function withoutTitle(name: string) {
  return name.replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '');
}

export function firstName(name: string): string {
  return withoutTitle(name).split(/\s+/)[0];
}

export function initials(name: string): string {
  const words = withoutTitle(name).split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
