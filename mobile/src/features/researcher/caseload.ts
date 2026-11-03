export type CaseloadStudent = {
  id: string;
  name: string;
  week: number;
  lastActiveAt: string;
  /** Latest PHQ-9 total, and its question 9 (thoughts of self-harm) answer, 0 to 3. */
  phq9: { score: number; item9: number; at: string };
};

export type Call = { studentId: string; startsAt: string; durationMin: number };

function at(now: Date, daysBack: number, hour: number, minute = 0) {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysBack,
    hour,
    minute
  ).toISOString();
}

function hoursAgo(now: Date, hours: number) {
  return new Date(now.getTime() - hours * 3_600_000).toISOString();
}

// Stand-in caseload for Grace until the backend serves real students. Dates are built around
// `now` so it always looks current.
export function mockCaseload(now = new Date()): { students: CaseloadStudent[]; calls: Call[] } {
  const students: CaseloadStudent[] = [
    {
      id: 's-tolu',
      name: 'Tolu Adebayo',
      week: 1,
      lastActiveAt: hoursAgo(now, 2),
      phq9: { score: 17, item9: 1, at: at(now, 1, 9) },
    },
    {
      id: 's-chiamaka',
      name: 'Chiamaka Obi',
      week: 5,
      lastActiveAt: hoursAgo(now, 5),
      phq9: { score: 12, item9: 0, at: at(now, 30, 9) },
    },
    {
      id: 's-ifeanyi',
      name: 'Ifeanyi Nwosu',
      week: 2,
      lastActiveAt: at(now, 6, 18),
      phq9: { score: 13, item9: 0, at: at(now, 9, 9) },
    },
    {
      id: 's-zainab',
      name: 'Zainab Bello',
      week: 4,
      lastActiveAt: hoursAgo(now, 20),
      phq9: { score: 14, item9: 0, at: at(now, 24, 9) },
    },
    {
      id: 's-emeka',
      name: 'Emeka Okeke',
      week: 6,
      lastActiveAt: at(now, 2, 21),
      phq9: { score: 11, item9: 0, at: at(now, 38, 9) },
    },
    {
      id: 's-seyi',
      name: 'Seyi Ogunleye',
      week: 3,
      lastActiveAt: hoursAgo(now, 9),
      phq9: { score: 21, item9: 0, at: at(now, 17, 9) },
    },
  ];
  const calls: Call[] = [
    { studentId: 's-chiamaka', startsAt: at(now, 0, 10), durationMin: 30 },
    { studentId: 's-zainab', startsAt: at(now, 0, 14), durationMin: 30 },
    { studentId: 's-emeka', startsAt: at(now, 0, 16, 30), durationMin: 30 },
    { studentId: 's-seyi', startsAt: at(now, -1, 11), durationMin: 30 },
  ];
  return { students, calls };
}
