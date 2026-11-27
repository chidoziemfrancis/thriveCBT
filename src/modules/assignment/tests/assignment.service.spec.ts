import type { EmailService } from '../../../integrations/email/email.service.js';
import type { StudentsService } from '../../users/students/services/students.service.js';
import { assignSchema } from '../dto/assignment.dto.js';
import type { AssignmentRepository } from '../repositories/assignment.repository.js';
import {
  AssignmentService,
  pickResearcher,
} from '../services/assignment.service.js';

const NOW = new Date('2026-11-27T10:00:00Z');
const grace = {
  id: 'r-grace',
  email: 'grace@uni.edu',
  researcherProfile: { name: 'Grace Bello', title: 'PhD student', bio: null },
};

function setup(
  options: {
    codeOwner?: boolean;
    open?: { userId: string; capacity: number; students: number }[];
  } = {},
) {
  let saved: Record<string, unknown> | null = null;
  const repository = {
    findForStudent: vi.fn(async () => saved),
    researcherByCode: vi.fn(async (code: string) =>
      options.codeOwner && code === 'GRACE1'
        ? {
            name: 'Grace Bello',
            title: 'PhD student',
            bio: null,
            user: { id: 'r-grace', email: 'grace@uni.edu' },
          }
        : null,
    ),
    acceptingResearchers: vi.fn(async () => options.open ?? []),
    create: vi.fn(
      async (
        studentId: string,
        researcherId: string,
        method: string,
        assignedAt: Date,
      ) => {
        saved = {
          studentId,
          researcherId,
          method,
          assignedAt,
          researcher: { ...grace, id: researcherId },
        };
        return saved;
      },
    ),
  };
  const students = { getProfile: vi.fn(async () => ({ name: 'Kemi' })) };
  const email = {
    send: vi.fn(async (_message: { to: string; text: string }) => undefined),
  };
  const service = new AssignmentService(
    repository as unknown as AssignmentRepository,
    students as unknown as StudentsService,
    email as unknown as EmailService,
  );
  return { service, repository, email };
}

describe('pickResearcher', () => {
  it('picks among researchers with space, preferring the fewest students', () => {
    const open = [
      { userId: 'full', capacity: 10, students: 10 },
      { userId: 'busy', capacity: 10, students: 6 },
      { userId: 'quiet', capacity: 10, students: 2 },
    ];
    expect(pickResearcher(open, () => 0.99)).toBe('quiet');
    expect(
      pickResearcher([{ userId: 'full', capacity: 10, students: 10 }]),
    ).toBeNull();
  });
});

describe('AssignmentService', () => {
  it('matches a student with the researcher behind their code and emails that researcher', async () => {
    const { service, email } = setup({ codeOwner: true });
    await expect(service.assign('s1', 'GRACE1', NOW)).resolves.toMatchObject({
      researcher: { id: 'r-grace', name: 'Grace Bello' },
      method: 'invite',
      assignedAt: NOW.toISOString(),
    });
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'grace@uni.edu',
        text: expect.stringContaining('Kemi accepted your invite'),
      }),
    );
  });

  it('keeps the match even if the email fails', async () => {
    const { service, email } = setup({ codeOwner: true });
    email.send.mockRejectedValueOnce(new Error('Unosend down'));
    await expect(service.assign('s1', 'GRACE1', NOW)).resolves.toMatchObject({
      method: 'invite',
    });
  });

  it('matches at random without emailing when there is no code', async () => {
    const { service, email } = setup({
      open: [{ userId: 'r-tunde', capacity: 10, students: 1 }],
    });
    await expect(service.assign('s1', undefined, NOW)).resolves.toMatchObject({
      researcher: { id: 'r-tunde' },
      method: 'random',
    });
    expect(email.send).not.toHaveBeenCalled();
  });

  it('returns the same match when asked again', async () => {
    const { service, repository } = setup({ codeOwner: true });
    await service.assign('s1', 'GRACE1', NOW);
    await service.assign('s1', undefined, NOW);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('refuses an unknown code, and says when every researcher is full', async () => {
    const { service } = setup();
    await expect(service.assign('s1', 'NOPE12', NOW)).rejects.toMatchObject({
      code: 'ASSIGNMENT_CODE_NOT_FOUND',
    });
    await expect(service.assign('s1', undefined, NOW)).rejects.toMatchObject({
      code: 'ASSIGNMENT_NO_RESEARCHER',
    });
  });

  it('previews a code, and has nothing before a match', async () => {
    const { service } = setup({ codeOwner: true });
    await expect(service.preview('GRACE1')).resolves.toEqual({
      id: 'r-grace',
      name: 'Grace Bello',
      title: 'PhD student',
      bio: null,
    });
    await expect(service.get('s1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('invite code checks', () => {
  it('ignore spaces and case, as people type codes', () => {
    expect(assignSchema.parse({ inviteCode: ' grace 1 ' })).toEqual({
      inviteCode: 'GRACE1',
    });
    expect(assignSchema.safeParse({ inviteCode: 'g!' }).success).toBe(false);
    expect(assignSchema.parse({})).toEqual({});
  });
});
