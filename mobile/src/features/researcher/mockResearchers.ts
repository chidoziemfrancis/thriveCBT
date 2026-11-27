// The most students the study lets one researcher look after.
export const MAX_CASELOAD = 10;

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

// The researcher side's placeholder team until B5; students get their real researcher from the server.
export const MOCK_RESEARCHERS: Researcher[] = [
  {
    id: 'r-amara',
    name: 'Dr. Amara Okafor',
    title: 'Lead researcher',
    bio: 'I’ve supported students through tough terms for years. I’m here to listen, help you get the most from each session, and check in every week.',
    inviteCode: 'AMARA1',
    accepting: true,
    capacity: MAX_CASELOAD,
    studentCount: 10,
  },
  {
    id: 'r-tunde',
    name: 'Tunde Bello',
    title: 'Research assistant',
    bio: 'Think of me as your study buddy. I’ll keep you on track with gentle reminders and I’m always happy to talk through anything that feels unclear.',
    inviteCode: 'TUNDE1',
    accepting: true,
    capacity: MAX_CASELOAD,
    studentCount: 8,
  },
  {
    id: 'r-grace',
    name: 'Grace Eze',
    title: 'Research assistant',
    bio: 'I believe small steps add up. Each week we’ll look at how you’re doing and what might help, at whatever pace works for you.',
    inviteCode: 'GRACE1',
    accepting: true,
    capacity: MAX_CASELOAD,
    studentCount: 6,
  },
];
