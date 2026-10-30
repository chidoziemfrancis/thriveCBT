import type { Researcher } from './assign';

// Placeholder researchers until the backend provides the real team and their caseloads.
export const MOCK_RESEARCHERS: Researcher[] = [
  {
    id: 'r-amara',
    name: 'Dr. Amara Okafor',
    title: 'Lead researcher',
    bio: 'I’ve supported students through tough terms for years. I’m here to listen, help you get the most from each session, and check in every week.',
    inviteCode: 'AMARA1',
    accepting: true,
    capacity: 25,
    studentCount: 12,
  },
  {
    id: 'r-tunde',
    name: 'Tunde Bello',
    title: 'Research assistant',
    bio: 'Think of me as your study buddy. I’ll keep you on track with gentle reminders and I’m always happy to talk through anything that feels unclear.',
    inviteCode: 'TUNDE1',
    accepting: true,
    capacity: 20,
    studentCount: 9,
  },
  {
    id: 'r-grace',
    name: 'Grace Eze',
    title: 'Research assistant',
    bio: 'I believe small steps add up. Each week we’ll look at how you’re doing and what might help, at whatever pace works for you.',
    inviteCode: 'GRACE1',
    accepting: true,
    capacity: 20,
    studentCount: 9,
  },
];
